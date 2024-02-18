# 你必须要学习的 Rust 知识点： Trait

## 前言

自我们上一篇文章学习了 Rust 的智能指针之后，有提到过 Trait 的概念，但是这篇文章我们来加深一下对于 Trait 的理解。

这篇文章主要将介绍 Trait 是什么、常用的 Trait 有哪些、它和 TypeScript 中 interface 的对比，最后以一个对比学习的例子来加深理解。

## Trait(特型) 是什么？

在 Rust 中，Trait 是一种强大的抽象机制，类似于 TypeScript 中的接口（interface）或抽象类（abstract class）。它允许我们定义一组方法签名，这些方法可以由不同结构体类型来实现，从而实现多态性。

## 常用的 Trait 有哪些?

Rust 提供了一系列常用的 Trait，它们为不同类型定义了一致的行为。以下是一些常见的 Trait 及其使用示例：

### Clone 和 Copy： 

允许对象进行克隆或复制， Copy 一般用于简单的数据类型，比如说数字类型，布尔类型，复制的时候进行按位复制，而 Clone 一般用于复杂数据类型，比如引用、指针(存在堆内存上的数据)

```rust
#[derive(Copy, Clone, Debug)]
struct Point {
    x: i32,
    y: i32,
}

#[derive(Clone, Debug)]
struct Cat {
    name: String,
    age: u8,
}

fn main() {
    let mut point1 = Point { x: 10, y: 20 };
    // 按位复制，浅拷贝
    let point2 = point1;
    // 修改 point1 的 x 为 20
    point1.x = 20;
    // Point { x: 20, y: 20 }
    println!("{:?}", point1);
    // Point { x: 10, y: 20 }
    println!("{:?}", point2);

    // 字符串存放在堆内存
    let mut cat1 = Cat {
        name: "泡芙".to_string(),
        age: 6,
    };

    // 只能深度克隆，如果直接赋值 cat2 = cat1 则会发生移动行为
    let cat2 = cat1.clone();
    cat1.name = "泡芙喵喵".to_string();
    // Cat { name: "泡芙喵喵", age: 6 }
    println!("{:?}", cat1);
    // Cat { name: "泡芙", age: 6 }
    println!("{:?}", cat2);
}
```

### Debug：

用于格式化输出调试信息。

```rust
#[derive(Debug)]
struct Person {
    name: String,
    age: u32,
}

fn main() {
    // 使用 Debug
    let person = Person {
        name: "泡芙".to_string(),
        age: 6,
    };
    // 这里的 :? 使用了 Debug 特征
    // 打印 Person { name: "泡芙", age: 6 }
    println!("{:?}", person);
}
```

### Default： 

提供默认的构造方法。

```rust
#[derive(Clone, Copy, Debug)]
struct Point {
    x: i32,
    y: i32,
}

impl Default for Point {
    fn default() -> Self {
        Point { x: 0, y: 0 }
    }
}

fn main() {
    let default_point = Point::default();
    // 或者
    let default_point: Point = Default::default();
    // 打印 Point { x: 0, y: 0 }
    println!("{:?}", default_point);
}
```

### Iterator： 

提供迭代器的功能。

```rust
struct Counter {
    current: usize,
    max: usize,
}

impl Iterator for Counter {
    type Item = usize;

    fn next(&mut self) -> Option<Self::Item> {
        if self.current < self.max {
            let result = self.current;
            self.current += 1;
            Some(result)
        } else {
            None
        }
    }
}

fn main() {
    // 使用 Iterator
    let counter = Counter { current: 0, max: 5 };
    // 依次打印 0 1 2 3 4
    for num in counter {
        println!("{}", num);
    }
}
```

### Deref 和 Drop: 

上一章中我们也讲过智能指针的例子，简单来说，只要实现了 Deref 和 Drop 这两个 Trait 并提供了额外能力的数据结构，那么它就是智能指针

```rust
use std::ops::{Deref, Drop};

// 定义包含一个值的自定义智能指针结构体
struct MySmartPointer<T>(T);

// 实现 Deref trait，允许像引用一样使用智能指针
impl<T> Deref for MySmartPointer<T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

// 实现 Drop trait，定义离开作用域时的清理逻辑
impl<T> Drop for MySmartPointer<T> {
    fn drop(&mut self) {
        println!("Drop MySmartPointer");
    }
}

fn main() {
    // 创建一个 MySmartPointer 实例
    let my_pointer = MySmartPointer("Hello, Rust!");

    // 使用 Deref trait，以引用方式访问内部值
    println!("Value: {}", *my_pointer);

    // my_pointer 离开作用域时，Drop trait 触发清理逻辑
}
```

### Eq 、PartialEq、Ord 、PartialOrd：

Eq 和 PartialEq 提供相等性比较，PartialEq 用于部分相等性比较，Eq 用于完全相等性比较，Eq 继承自 PartialEq，一般只需要实现 PartialEq 就可以满足 Eq 的要求，但是 f32 和 f64 是唯二的两个实现了 PartialEq 却没实现 Eq 的。 只需要知道 PartialEq 用于浮点数就行了，浮点数类型可能在数学上相等，但由于精度问题，它们在计算机上并不完全相等，比如说 JavaScript 里面的经典问题 0.1 + 0.2 === 0.3 为 false 就是由于精度问题导致的。

Ord 和 PartialOrd 则是用于排序，也就是说用于大小的比较，其它的和上面提到的 Eq 和 PartialEq 差不多。

```rust
#[derive(PartialEq, PartialOrd)]
struct Temperature {
    value: f64,
}

// 这里也可以省略掉 Eq 和 Ord
#[derive(Eq, PartialEq, Ord, PartialOrd)]
struct Count {
    value: u32,
}

fn main() {
    let temp1 = Temperature { value: 25.5 };
    let temp2 = Temperature { value: 30.0 };
    let temp3 = Temperature { value: 20.0 };
    let temp4 = Temperature { value: 20.0 };
    assert!(temp1 < temp2);
    assert!(temp3 == temp4);

    let count1 = Count { value: 1 };
    let count2 = Count { value: 1 };
    assert!(count1 == count2)
}
```

### From 和 Into:

这两个 Trait 用于数据类型转换。From 用于实现从其他类型到自定义类型的转换，Into 用于将当前类型转换为所需的类型。

```rust
// 定义一个自定义类型
#[derive(Debug)]
struct MyInt(i32);

// 实现 From trait，允许从 i32 到 MyInt 的转换
impl From<i32> for MyInt {
    fn from(value: i32) -> Self {
        MyInt(value)
    }
}

// 实现 Into trait，允许从 MyInt 到 i32 的转换
impl Into<i32> for MyInt {
    fn into(self) -> i32 {
        self.0
    }
}

fn main() {
    // 使用 From trait 进行转换
    let my_int: MyInt = 42.into();
    println!("MyInt value: {:?}", my_int);

    // 使用 Into trait 进行转换
    let my_int: MyInt = MyInt(100);
    let int_value: i32 = my_int.into();
    println!("Converted value: {:?}", int_value);
}
```

## AsRef 和 AsMut:

AsRef 允许类型转换为一个引用，AsMut 类似于 AsRef，只不过是将类型转换为可变引用

```rust
// 定义一个自定义类型
struct MyStringWrapper(String);

// 实现 AsRef trait，允许从 MyStringWrapper 到 String 的引用转换
impl AsRef<str> for MyStringWrapper {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

// 实现 AsMut trait，允许从 MyStringWrapper 到 String 的可变引用转换
impl AsMut<String> for MyStringWrapper {
    fn as_mut(&mut self) -> &mut String {
        &mut self.0
    }
}

fn main() {
    // 创建一个 MyStringWrapper 实例
    let mut my_string_wrapper = MyStringWrapper(String::from("Hello"));

    // 使用 AsRef trait 转换为对 String 的引用
    let str_ref: &str = my_string_wrapper.as_ref();
    // AsRef: "Hello"
    println!("AsRef: {:?}", str_ref);

    // 使用 AsMut trait 转换为对 String 的可变引用
    let string_mut_ref: &mut String = my_string_wrapper.as_mut();
    string_mut_ref.push_str(", 泡芙!");
    // AsMut: "Hello, 泡芙!"
    println!("AsMut: {:?}", string_mut_ref);
}
```

## TypeScript 和 Rust 的对比学习

假设有一个在数据库中保存和获取文档和图像的项目。由于这两种文件类型都存储在相同的实体中并共享共同的特征，我们可以使用接口来描述这些共同的信息。

在 TypeScript 中，我们可以定义如下接口：

```typescript
// 实体中的共同字段
interface Entity {
  id: string;
  timestamp: number;
}

// 文档接口
interface Document extends Entity {
  revised: boolean;
}

// 图像接口
interface Image extends Entity {
  type: string;
}
```

由于 Rust 没有继承的机制，最简单的对应实现就是复制一下一样的类型：

```rust
// 文档结构
struct Document {
    id: String,
    timestamp: u64,
    revised: bool,
}

// 图像结构
struct Image {
    id: String,
    timestamp: u64,
    mime_type: String,
}
```

## 继承和泛型

假设我们想要查找特定的文档或图像。在 TypeScript 中，我们可以编写以下代码来完成：

```typescript
const getDocument = (id: string, documents: Document[]): Document | undefined =>
  documents.find(({ id: docId }) => docId === id);

const getImages = (id: string, images: Image[]): Image | undefined =>
  images.find(({ id: imageId }) => imageId === id);
```

上面的是不那么优雅的实现，但是由于两种类型都实现了相同的 Entity 接口，我们可以提取一个通用函数来避免重复：

```typescript
// 抽取一个通用的函数，并加上一个泛型限制为任何继承了 Entity 的类型
const get = <T extends Entity>(id: string, elements: T[]): T | undefined =>
  elements.find(({ id: elementId }) => elementId === id);

// 获取文档
const getDocument = (id: string, documents: Document[]): Document | undefined =>
  get<Document>(id, documents);

// 获取图像
const getImages = (id: string, images: Image[]): Image | undefined =>
  get<Image>(id, images);
```

在 Rust 中，对上面的代码进行一个不优雅的实现，那就是复制粘：

```rust
// 获取文档
fn get_document(id: String, documents: Vec<Document>) -> Option<Document> {
    documents.into_iter().find(|document| document.id == id)
}

// 获取图像
fn get_images(id: String, images: Vec<Image>) -> Option<Image> {
    images.into_iter().find(|image| image.id == id)
}
```

如你所见，Rust 代码与 TypeScript 的实现很像。但是 Rust 没有继承或 `interface` 关键字，我们没办法完全像上面 TypeScript 一样实现通用函数来避免重复的代码。

那么 Rust 中如何解决这个问题？ 这就是 `Trait` 该发挥作用的地方啦。

在这个例子中，文档和图像共享的通用特征是它们都可以使用 ID 进行比较。

因此，我们可以创建一个 `Compare` Trait，并让文档和图像结构体来实现它：

```rust
trait Compare {
    fn compare(&self, id: &str) -> bool;
}

impl Compare for Document {
    fn compare(&self, id: &str) -> bool {
        self.id == id
    }
}

impl Compare for Image {
    fn compare(&self, id: &str) -> bool {
        self.id == id
    }
}
```

最后，我们可以在 Rust 中提取通用代码，就像在 TypeScript 中一样。

```rust
fn get<T: Compare>(id: String, elements: Vec<T>) -> Option<T> {
    elements.into_iter().find(|element| element.compare(&id))
}

fn get_document(id: String, documents: Vec<Document>) -> Option<Document> {
    get(id, documents)
}

fn get_image(id: String, images: Vec<Image>) -> Option<Image> {
    get(id, images)
}
```

值得注意的是，在 Rust 中，`Trait`可以使用“+”符号组合，允许我们定义多个共同特征。例如：

```rust
fn get<T: Compare + OtherTrait>(id: String, elements: Vec<T>) -> Option<T> {
    elements
        .into_iter()
        .find(|element| element.compare(&id) && element.other_trait(&id))
}
```

## 结论

这篇文章简单的介绍了一些 `Trait` 的概念以及用法，但我希望这篇文章对那些像我一样在同时学习 Rust 和 JavaScript 的开发者有所帮助。
