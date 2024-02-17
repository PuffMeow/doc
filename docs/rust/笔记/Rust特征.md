# 你必须要学习的 Rust 知识点： Trait

## 前言

这篇文章主要将介绍 Trait 是什么、常用的 Trait 有哪些、它和 TypeScript 中 interface 的对比，最后以一个对比学习的例子来加深理解。

## Trait(特型) 是什么？

在 Rust 中，Trait 是一种强大的抽象机制，类似于 TypeScript 中的接口（interface）或抽象类（abstract class）。它允许我们定义一组方法签名，这些方法可以由不同结构体类型来实现，从而实现多态性。

## 常用的 Trait 有哪些?

Rust 提供了一系列常用的 Trait，它们为不同类型定义了一致的行为。以下是一些常见的 Trait 及其使用示例：

Clone 和 Copy： 允许对象进行克隆或复制。

```rust
#[derive(Clone, Copy)]
struct Point {
    x: i32,
    y: i32,
}

// 使用 Clone 和 Copy
let point1 = Point { x: 1, y: 2 };
// point2 和 point1 是不同内存地址的对象
let point2 = point1.clone();
```

Debug： 用于格式化输出调试信息。

```rust
#[derive(Debug)]
struct Person {
    name: String,
    age: u32,
}

// 使用 Debug
let person = Person { name: "泡芙".to_string(), age: 6 };
// 这里的 :? 使用了 Debug 特征
println!("{:?}", person);
```

Default： 提供默认的构造方法。

```rust
impl Default for Point {
    fn default() -> Self {
        Point { x: 0, y: 0 }
    }
}

// 使用 Default
let default_point: Point = Default::default();
```

Iterator： 提供迭代器的功能。

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

// 使用 Iterator
let counter = Counter { current: 0, max: 5 };
for num in counter {
    println!("{}", num);
}
```

Deref: 提供智能指针的解引用。

```rust
use std::ops::Deref;

struct MyBox<T>(T);

impl<T> Deref for MyBox<T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

// 使用 Deref
let my_box = MyBox(String::from("Hello"));
println!("{}", *my_box);
```

Eq 和 PartialEq： 提供相等性比较。

```rust
#[derive(Eq, PartialEq)]
struct Color {
    red: u8,
    green: u8,
    blue: u8,
}

// 使用 Eq 和 PartialEq
let color1 = Color { red: 255, green: 0, blue: 0 };
let color2 = Color { red: 255, green: 0, blue: 0 };
assert_eq!(color1, color2);
```

Ord 和 PartialOrd： 提供排序比较。

```rust
#[derive(Ord, PartialOrd)]
struct Temperature {
    value: f64,
}

// 使用 Ord 和 PartialOrd
let temp1 = Temperature { value: 25.5 };
let temp2 = Temperature { value: 30.0 };
assert!(temp1 < temp2);
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

如你所见，Rust 代码与 TypeScript 的实现很像。但是 Rust 没有继承或`interface`关键字，我们没办法完全像上面 TypeScript 一样实现通用函数来避免重复的代码。

那么 Rust 中如何解决这个问题？ 这就是`trait`该发挥作用的地方啦。

在这个例子中，文档和图像共享的通用特征是它们都可以使用 ID 进行比较。

因此，我们可以创建一个`Compare`trait，并让文档和图像结构体来实现它：

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

值得注意的是，在 Rust 中，`trait`可以使用“+”符号组合，允许我们定义多个共同特征。例如：

```rust
fn get<T: Compare + OtherTrait>(id: String, elements: Vec<T>) -> Option<T> {
    elements
        .into_iter()
        .find(|element| element.compare(&id) && element.other_trait(&id))
}
```

## 结论

这篇文章简单的介绍了一些 `trait` 的概念以及用法，但我希望这篇文章对那些像我一样在同时学习 Rust 和 JavaScript 的开发者有所帮助。
