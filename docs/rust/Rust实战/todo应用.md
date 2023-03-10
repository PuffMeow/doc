# 一个迷你 todo 应用

该文章将使用 Rust 从零去做一个入门级别的 TODO 命令行应用

你将学会什么？

- 基本的命令行操作
- 文件读写和文件结构组织

我们将会通过命令行输入来实现对根目录下 `state.json` 文件的编辑，如：

- `cargo run create 买菜`

- `cargo run get 买菜`

- `cargo run delete 买菜`

- `cargo run edit 买菜`

我们的 todo 状态会有 pending 和 done 这两种，create 操作将创建一个 `{"买菜":"pending"}` 的状态，edit 操作主要就是将 pending 状态转变为 done 状态

## 需要安装的依赖

我们要操作 json 数据结构，所以要安装下面这个 crate

```toml
[package]
edition = "2021"
name = "todo_app"
version = "0.1.0"

[dependencies]
serde_json = {default-feature = false, version = "1.0", feature = ["alloc"]}
```

## 文件目录组织

```
|   main.rs               主文件
|   process.rs            处理 todo 命令行输入
|   state.rs              读写文件
|
\---todo
    |   mod.rs            类似于 js 里面的 index.js
    |
    \---structs           struct 数据结构组织
        |   base.rs       基础参数的数据结构
        |   done.rs       完成状态的数据结构
        |   mod.rs        类似于 js 里面的 index.js
        |   pending.rs    处理中状态的数据结构
        |
        \---traits        (特征)类似于 ts 里面的 interface
                create.rs 创建操作
                delete.rs 删除操作
                edit.rs   编辑操作
                get.rs    查询操作
                mod.rs    类似于 js 里面的 index.js
```

## 主文件

```rust
// 有一点点像 import process from './process.rs'
mod process;
mod state;
mod todo;

// 使用外部的库、标准库或自己定义的工具
use process::process_input;
use serde_json::Map;
use serde_json::Value;
use state::read_file;
use std::env;
use todo::todo_factory;

fn main() {
    // 收集所有命令行的参数，转换成数组
    let args: Vec<String> = env::args().collect();
    // 拿到第一个参数如 get、delete、edit、create
    let command: &String = &args[1];
    // 第二个参数是用来记录事件的
    let title: &String = &args[2];

    // 读取根目录的 state.json 文件并转换成 map json 结构
    let state: Map<String, Value> = read_file("./state.json");

    // 如果事件已经存取过了，那就直接获取，没有就将其状态设置为 pending
    let status: String;
    match &state.get(title) {
        Some(result) => status = result.to_string().replace('\"', ""),
        None => status = "pending".to_string(),
    }

    // todo_factory 工厂函数用于处理 pending 和 done 状态的输入
    let item = todo_factory(&status, title).expect(&status);
    // 将状态输入到本地文件中
    process_input(item, command.to_string(), &state);
}
```

上面我们看到了 3 个主要我们需要自己编写的函数:

- read_file 读取文件
- todo_factory 状态工厂函数
- process_input 处理输入

接下来让我们一个一个来看下这几个函数

## 读取文件

read_file 函数位于 `src/state.rs` 路径下，该文件主要是用来存储状态操作的，里面包含读取和写入两个函数，让我们主要看下 read_file 这个函数，它的功能：

- 打开文件
- 读取文件
- 将读取到的文件内容转成 json 对象
- 返回读取到的 json 对象

```rust
use std::fs::{self, File};
use std::io::Read;

use serde_json::json;
use serde_json::value::Value;
use serde_json::Map;

/** 读取文件 */
pub fn read_file(file_name: &str) -> Map<String, Value> {
    // 打开文件
    let mut file = File::open(file_name).unwrap();
    // 创建一个 string buffer 用于存储数据
    let mut data = String::new();
    // 读取数据写入到 buffer
    file.read_to_string(&mut data).unwrap();
    // 将读取到的字符串转换成 json 文本格式 Value 类型
    let json: Value = serde_json::from_str(&data).unwrap();
    // 将 json 文本格式转换成 json 对象
    let state: Map<String, Value> = json.as_object().unwrap().clone();
    // 将这个对象返回出去
    return state;
}

/** 写入文件 */
pub fn write_to_file(file_name: &str, state: &mut Map<String, Value>) {
    // json! 这个宏用于将 json 字面量对象转换回 json 文本 Value 格式
    let new_data = json!(state);
    // 将 json 文本写入到文件中
    fs::write(file_name, new_data.to_string()).expect("unable to write to file");
}
```

## 状态处理工厂函数

看完文件读取操作我们再来看下第二个主要函数 todo_factory，这个函数主要是根据事件的状态和通过命令行输入的 title 事件名称，然后构建出一个相应的数据结构

该文件位于 `src/todo/mod.rs` 路径下

它的作用主要是根据输入的 pending/done 状态，然后创建出一个对应的数据结构

```rust
// 将 structs 向外部导出
pub mod structs;
use structs::done::Done;
use structs::pending::Pending;

// 创建一个包含 pending 和 done 状态的枚举
pub enum ItemTypes {
    Pending(Pending),
    Done(Done),
}

/** 状态处理工厂函数 */
pub fn todo_factory(item_type: &str, item_title: &str) -> Result<ItemTypes, &'static str> {
    match item_type {
        "pending" => {
            // 创建一个 pending 状态的数据结构，然后返回出去
            let pending_item = Pending::new(item_title);
            Ok(ItemTypes::Pending(pending_item))
        }
        "done" => {
            // 创建一个 done 状态的数据结构，然后返回出去
            let done_item = Done::new(item_title);
            Ok(ItemTypes::Done(done_item))
        }
        // 如果不是这两个状态就返回一个错误
        _ => Err("This is not accepted!"),
    }
}
```

从上面的代码中我们可以看到下面这两行代码，这是我们主要需要定义的两个状态数据结构，他们位于 `src/todo/structs` 路径下

```rust
use structs::done::Done;
use structs::pending::Pending;
```

不过在看上面两个数据结构之前，我们需要先来看下另一个基础的数据结构，就是 base，因为上面两个数据结构是基于 base 的，实现一个类似于面向对象语言里继承的做法，base 是它们俩的基类

该文件位于 `src/todo/structs/base.rs` 路径下

```rust
pub struct Base {
    pub title: String,
    pub status: String,
}

// 为这个 Base 数据结构实现一个 new 方法，并返回一个实例化后的数据结构
impl Base {
    pub fn new(input_title: &str, input_status: &str) -> Base {
        Base {
            title: input_title.to_string(),
            status: input_status.to_string(),
        }
    }
}
```

现在我们用 Pending 和 Done 两个 struct 来 "继承" Base

该文件位于 `src/todo/structs/pending.rs` 路径下

```rust
use super::base::Base;


pub struct Pending {
    pub super_struct: Base,
}

impl Pending {
    pub fn new(input_title: &str) -> Pending {
        Pending {
            super_struct: Base::new(input_title, "pending"),
        }
    }
}
```

该文件位于 `src/todo/structs/done.rs` 路径下

```rust
use super::base::Base;

pub struct Done {
    pub super_struct: Base,
}

impl Done {
    pub fn new(input_title: &str) -> Done {
        Done {
            super_struct: Base::new(input_title, "done"),
        }
    }
}
```

## Trait(特征)

Trait 类似于 TS 里的 interface 接口，现在我们要为我们的 struct 来实现一些在 Trait 里面定义的方法，文件路径在
`src/todo/structs/traits`

### Create trait

文件路径在 `src/todo/structs/traits/create`

```rust
use serde_json::{json, Map, Value};

use crate::state::write_to_file;

pub trait Create {
    // 为这个 trait 实现一个默认的 create 方法
    fn create(&self, title: &String, status: &String, state: &mut Map<String, Value>) {
        state.insert(title.to_string(), json!(status));
        write_to_file("./state.json", state);
        println!("\n\n{} is being created\n\n", title);
    }
}
```

### Get trait

文件路径在 `src/todo/structs/traits/get`

```rust
use serde_json::{Map, Value};

pub trait Get {
    fn get(&self, title: &String, state: &Map<String, Value>) {
        let item = state.get(title);
        match item {
            Some(result) => {
                println!("\n\nItem: {}", title);
                println!("Status: {} \n\n", result);
            }
            None => println!("item: {} was not find", title),
        }
    }
}
```

### Delete trait

文件路径在 `src/todo/structs/traits/delete`

```rust
use serde_json::{Map, Value};

use crate::state::write_to_file;

pub trait Delete {
    fn delete(&self, title: &String, state: &mut Map<String, Value>) {
        state.remove(title);
        write_to_file("./state.json", state);
        println!("\n\n{} is being deleted\n\n", title);
    }
}
```

### Edit trait

该 Trait 主要实现两个方法，一个是将事件设置为 pending 状态，一个将事件设置为 done 状态

文件路径在 `src/todo/structs/traits/edit`

```rust
use serde_json::{json, Map, Value};

use crate::state::write_to_file;

pub trait Edit {
    fn set_to_done(&self, title: &String, state: &mut Map<String, Value>) {
        state.insert(title.to_string(), json!("done".to_string()));
        write_to_file("./state.json", state);
        println!("\n\n{} is being set to done\n\n", title);
    }

    fn set_to_pending(&self, title: &String, state: &mut Map<String, Value>) {
        state.insert(title.to_string(), json!("pending".to_string()));
        write_to_file("./state.json", state);
        println!("\n\n{} is being set to pending\n\n", title);
    }
}
```

### 导出 trait

文件路径在 `src/todo/structs/traits/mod`

```rust
pub mod create;
pub mod delete;
pub mod edit;
pub mod get;
```

## 为 struct 实现 trait

接下来我们为 Pending 和 Done 两个 struct 来实现这几个 trait

### Pending

我们为 Pending 实现所有的 4 个 trait

```rust
use super::base::Base;
use super::traits::create::Create;
use super::traits::delete::Delete;
use super::traits::edit::Edit;
use super::traits::get::Get;

pub struct Pending {
    pub super_struct: Base,
}

impl Pending {
    pub fn new(input_title: &str) -> Pending {
        Pending {
            super_struct: Base::new(input_title, "pending"),
        }
    }
}

impl Delete for Pending {}
impl Create for Pending {}
impl Edit for Pending {}
impl Get for Pending {}
```

### Done

为 Done 实现除了 Create 以外的 trait

文件路径在 `src/todo/structs/done`

```rust
use super::base::Base;
use super::traits::delete::Delete;
use super::traits::edit::Edit;
use super::traits::get::Get;

pub struct Done {
    pub super_struct: Base,
}

impl Done {
    pub fn new(input_title: &str) -> Done {
        Done {
            super_struct: Base::new(input_title, "done"),
        }
    }
}

impl Delete for Done {}
impl Edit for Done {}
impl Get for Done {}
```

### 导出 struct

```rust
mod base;
pub mod done;
pub mod pending;
pub mod traits;
```

## Process 输入处理

文件位于 `src/process.rs` 路径下

```rust
use serde_json::{Map, Value};

use crate::todo::{
    structs::{
        done::Done,
        pending::Pending,
        traits::{create::Create, delete::Delete, edit::Edit, get::Get},
    },
    ItemTypes,
};

// 处理 pending 状态
fn process_pending(item: Pending, command: String, state: &Map<String, Value>) {
    let mut state = state.clone();
    // 根据用户的输入来调用不同的方法
    match command.as_str() {
        "get" => item.get(&item.super_struct.title, &state),
        "create" => item.create(
            &item.super_struct.title,
            &item.super_struct.status,
            &mut state,
        ),
        "delete" => item.delete(&item.super_struct.title, &mut state),
        "edit" => item.set_to_done(&item.super_struct.title, &mut state),
        _ => println!("command: {} is not supported", command),
    }
}

// 处理 done 状态
fn process_done(item: Done, command: String, state: &Map<String, Value>) {
    let mut state = state.clone();

    match command.as_str() {
        "get" => item.get(&item.super_struct.title, &state),
        "delete" => item.delete(&item.super_struct.title, &mut state),
        "edit" => item.set_to_pending(&item.super_struct.title, &mut state),
        _ => println!("command: {} is not supported", command),
    }
}

// 处理用户的输入，根据输入来匹配枚举，然后执行不同的操作
pub fn process_input(item: ItemTypes, command: String, state: &Map<String, Value>) {
    match item {
        ItemTypes::Pending(item) => process_pending(item, command, state),
        ItemTypes::Done(item) => process_done(item, command, state),
    }
}
```

## 最后

按照上面的代码一步一步来完成就可以执行程序了，在根目录下新建一个 `state.json` 文件，写入一个空对象，不然会报错(代码没做处理)

```json
{}
```

最后再在控制台上去执行

```bash
cargo run create shopping
```

然后就能看到 state.json 中多了一条记录

```json
{ "shopping": "pending" }
```

其它的方法就交由你们自己去尝试好了~
