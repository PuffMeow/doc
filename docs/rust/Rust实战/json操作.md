## 知识点

这篇文章会以解析一个 JsonSchema 和对 package.json 文件进行增删改查为例，带你去了解如何使用 Rust 去操作一个 json 字符串。

涉及的知识点：

- Rust struct 结构体
- 文件操作
- 对 json 的解析和增删改查

## 需要去解析的 JsonSchema

这里以一个比较简单并且典型的 JsonSchema 为例子，接下来我们就用 serde_json 来解析一下。

```json
{
  "title": "Schema",
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string"
    },
    "lastName": {
      "type": "string"
    },
    "age": {
      "type": "number"
    },
    "hairColor": {
      "enum": [
        {
          "title": "hair color1",
          "value": "color1"
        },
        {
          "title": "hair color2",
          "value": "color2"
        },
        {
          "title": "hair color3",
          "value": "color3"
        }
      ],
      "type": "string"
    },
    "hairColor2": {
      "enum": ["color1", "color2"],
      "type": "string"
    }
  }
}
```

### 创建 Rust 项目

```
cargo new <project-name>
```

我们这里就用 `cargo new parse-json`

然后 `Cargo.toml` 中引入依赖：

```toml
[dependencies]
# 这里记得开启 serde 特性，因为我们要在 serde_json 中使用
indexmap = {version = "2.0.0", features = ["serde"]}
serde = {version = "1.0", features = ["derive"]}
serde_json = {version = "1.0.104"}
```

接下来我们就创建一个 example.json 文件，然后把上面那一大串 json 复制进去，一会我们会用

### 编写结构体

我们现在需要根据上面的 JsonSchema 为它实现一个标准的结构体，我们在 src 目录下新建一个 `types.rs` 文件

```rust
// 引入依赖
use indexmap::IndexMap;
use serde::Deserialize;

/// 这里我们使用这两个派生宏用来反序列化 Json 和支持 Debug 打印
#[derive(Deserialize, Debug)]
pub struct JsonSchema {
  pub title: Option<String>,
  /// type 是关键字，所以我们以 json_type 来命名，反序列化的时候重命名为 type 字段
  #[serde(rename(deserialize = "type"))]
  pub json_type: Option<String>,
  /// 这里使用 indexmap 的原因是因为我们要严格保证字段的插入顺序
  pub properties: Option<IndexMap<String, JsonSchema>>,
  pub items: Option<Box<JsonSchema>>,
  /// enum 是关键字，所以我们以 enum_vals 来命名，反序列化的时候需要重命名为 enum 字段
  #[serde(rename(deserialize = "enum"))]
  pub enum_vals: Option<EnumTypes>,
  pub description: Option<String>,
}

#[derive(Deserialize, Debug)]
/// 这里的枚举我们使用了 untagged，表示在反序列化时，`serde_json` 会尝试将 JSON 数据解析为与字段类型匹配的任何一个枚举变体
#[serde(untagged)]
pub enum EnumTypes {
  EnumType(Vec<EnumType>),
  StringEnum(Vec<String>),
}

#[derive(Deserialize, Debug)]
pub struct EnumType {
  pub title: Option<String>,
  pub value: Option<String>,
}
```

上面使用枚举的原因是因为我们 JsonSchema 中的枚举会有两种不同的数据结构：

```json
"enum": ["color1", "color2"],

"enum": [
  {
  "title": "hair color1",
  "value": "color1"
  },
  {
  "title": "hair color2",
  "value": "color2"
  }
]
```

为了更加方便大家理解上面的数据结构，我这里同时贴一个 TypeScript 版本的出来，它们是完全对应的

```ts
export type IEnum = IEnumType[] | string[];

export interface IJsonSchema {
  title?: string;
  type?: string;
  properties?: { [key: string]: IJsonSchema };
  items?: IJsonSchema;
  enum?: IEnum;
  description?: string;
}

export interface IEnumType {
  title?: string;
  value?: string;
}
```

### 解析 Json 字符串

接下来我们就解析一个 JsonSchema 字符串，现在我们去到 `main.rs` 入口中，编写一个解析 Json 的函数，入参是 Json 字符串，出参是一个符合 serde_json 反序列化特征的结构体，当解析出错的时候返回 None

```rust
fn parse_json<T: DeserializeOwned>(schema: &str) -> Option<T> {
    match serde_json::from_str(schema) {
        Ok(parsed) => Some(parsed),
        Err(e) => {
            eprintln!("{}", e);
            None
        }
    }
}
```

然后我们到 main.rs 主逻辑中去编写读取函数

```rust
fn main() {
    // 我们可以保证 example.json 文件一定存在，所以直接 unwrap 即可
    let example_json = fs::read_to_string("example.json").unwrap();
    // 使用 turbofish 写法传入泛型 JsonSchema
    let parsed_json = parse_json::<JsonSchema>(&example_json).unwrap();

    // 打印出结构体
    println!("{:#?}", &parsed_json);
}
```

最后我们解析得到的结构体是这样的：

```rust
JsonSchema {
    title: Some(
        "Schema",
    ),
    json_type: Some(
        "object",
    ),
    properties: Some(
        {
            "firstName": JsonSchema {
                title: None,
                json_type: Some(
                    "string",
                ),
                properties: None,
                items: None,
                enum_vals: None,
                description: None,
            },
            "lastName": JsonSchema {
                title: None,
                json_type: Some(
                    "string",
                ),
                properties: None,
                items: None,
                enum_vals: None,
                description: None,
            },
            "age": JsonSchema {
                title: None,
                json_type: Some(
                    "number",
                ),
                properties: None,
                items: None,
                enum_vals: None,
                description: None,
            },
            "hairColor": JsonSchema {
                title: None,
                json_type: Some(
                    "string",
                ),
                properties: None,
                items: None,
                enum_vals: Some(
                    EnumType(
                        [
                            EnumType {
                                title: Some(
                                    "hair color1",
                                ),
                                value: Some(
                                    "color1",
                                ),
                            },
                            EnumType {
                                title: Some(
                                    "hair color2",
                                ),
                                value: Some(
                                    "color2",
                                ),
                            },
                            EnumType {
                                title: Some(
                                    "hair color3",
                                ),
                                value: Some(
                                    "color3",
                                ),
                            },
                        ],
                    ),
                ),
                description: None,
            },
            "hairColor2": JsonSchema {
                title: None,
                json_type: Some(
                    "string",
                ),
                properties: None,
                items: None,
                enum_vals: Some(
                    StringEnum(
                        [
                            "color1",
                            "color2",
                        ],
                    ),
                ),
                description: None,
            },
        },
    ),
    items: None,
    enum_vals: None,
    description: None,
}
```

拿到这个数据结构之后，我们就可以做很多事情了，比如对它进行增删改查啥的。

后面我们以一个前端最常见的 json 文件 package.json 为例，讲解一下如何操作 json 数据

### 解析 package.json

在项目根目录下我们新建一个 package.json 文件，写入下面的内容

```json
{
  "name": "puffmeow",
  "version": "0.1.0",
  "description": "Testing",
  "devDependencies": {
    "typescript": "^5.0.2",
    "vite": "^4.4.7",
    "vitest": "^0.33.0"
  },
  "dependencies": {}
}
```

首先我们编写一个 Rust 结构体

```rust
/// 我们派生序列化和反序列化，一会需要使用到
#[derive(Debug, Serialize, Deserialize)]
pub struct Package {
    pub name: Option<String>,
    pub version: Option<String>,
    pub description: Option<String>,
    pub author: Option<String>,
    #[serde(rename(deserialize = "devDependencies"))]
    pub dev_dependencies: Option<IndexMap<String, String>>,
    pub dependencies: Option<IndexMap<String, String>>,
}
```

然后在 main.rs 中对它进行解析~，打印出的数据结构我就不贴出来了，大家自行和上面的对照脑补。
接下来我们就来说下如何对 json 数据进行增删改查。这个步骤在我们的 Node.js 中十分简单，但是在 Rust 中怎么去实现捏?

```rust
fn main() {
    let example_json = fs::read_to_string("package.json").unwrap();
    let parsed_json = parse_json::<Package>(&example_json).unwrap();

    println!("{:#?}", &parsed_json);
}
```

### 对 package.json 进行增删改查

#### 增加数据

我们上面定义了 author 字段，但是 package.json 中并没有，那么接下来我们想要去写入 author 该如何操作？
