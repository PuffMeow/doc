# Rust 核心：所有权、借用、生命周期

## 前言

之前的文章中我们都说过，Rust 是一门安全并且高效的语言，那么它是如何保证它的安全和高效的呢？

它的核心就是通过所有权、借用、生命周期这三个概念来确保内存安全，从而不需要进行垃圾回收。这篇文章我们就做一个对这几个概念的入门，帮助大家理解这几个概念。

## 所有权

### 所有权规则

在 Rust 中，在同一时间内每一个值会有一个变量作为它的主人，也就是说一个值同时只能有一个拥有者。这个拥有者就是变量，当这个拥有者离开作用域的时候，这个值就会被销毁。来看个例子：

```rust
fn main() {
    // s 是 hello 字符串的拥有者，字符串存放在堆内存上
    let s = String::from("hello");
    // 对 s 做一些事儿
 }  // 这里 s 离开作用域，hello 字符串就被销毁了
```

### 移动语义

当一个变量赋值给另一个变量的时候，不会发生任何复制行为，所有权只会发生转移，这个就被称为"移动语义"。来看个例子：

```rust
fn main() {
   let s1 = String::from("hello");
   // s1 移动到了 s2，s1 此时会失效
   let s2 = s1;
   // println!("{}", s1);  // 如果再使用 s1 就会报错，因为 s1 已经不再有效了
 }
```

### 克隆

因为字符串是存放在堆内存上的，如果这时候你不想发生移动，而想要复制一份新的数据，那么就可以使用克隆方法，克隆方法会进行深克隆，复制出一份新的堆内存数据。比如：

```rust
fn main() {
   let s1 = String::from("hello");
   // 创建一个 s1 的深克隆
   let s2 = s1.clone();
   // 这里 s1 和 s2 都能够使用
   println!("s1 = {}, s2 = {}", s1, s2);
 }
```

## 借用

### 引用和借用

你也可以创建一个数据的引用而不是进行所有权的转移。引用是指向值的指针，而借用是对值的临时使用权，默认创建的引用是不可变的。我们来通过例子看下引用和借用的区别：

```rust
fn main() {
   let s1 = String::from("hello");
   // 在这里 s1 被借用，函数拥有了 s1 的临时使用权
   let len = calculate_length(&s1);
   println!("The length of '{}' is {}.", s1, len);
 }

// 在这个函数中，s 是一个对 String 的引用
fn calculate_length(s: &String) -> usize {
   // 这里的 s 是只读的，它不可变，不能修改，比如说不能往 s 里面添加额外字符串
   s.len()
}
```

### 可变引用

上面那个例子我们看到的是不可变引用，那么如果想要对一个引用的值进行修改，那么可以使用可变引用，在 JavaScript 中，我们传一个对象到函数中就是可变引用，为方便理解来看个对比例子：

和 Rust 其实一样，在 JS 中字符串数据也是存在堆内存上的，栈上存放的是指向堆内存的一个指针

```js
const s1 = "hello";

// 这里的 s 就是对 s1 的可变引用(套用 Rust 中的概念)
function changeString(s) {
    s += " world";
}

changeString(s1);

// 打印 hello world，也就是我们对一个引用字符串里的值的修改也会影响到原始字符串
console.log(s1); 
```

在 Rust 中，对应于上面 JS 例子中的概念就是可变引用，在 Rust 中声明可变引用需要显式去标注 mut 关键字

```rust
fn main() {
  // 标注为可变的变量
  let mut s1 = String::from("hello");
  // s1 被可变借用了
  change_string(&mut s1);
  // 打印 hello world
  println!("{}", s1);
}

// s 就是 String 可变引用
fn change_string(s: &mut String) {
   s.push_str(" world");
}
```

### 防止数据竞争

Rust 的所有权和借用，通过保证在一个作用域内对一个数据只能存在一个可变引用或任意数量的不可变引用来防止数据竞争。也就是之前提到过的 “可变不共享，共享不可变”

```rust
fn main() {
    let mut x = 5;
    let y = &x; // y 从 x 借用一个不可变引用
    // 报错：y 从 x 借用一个可变借用。不能在一个作用域内同时出现可变借用和不可变借用
    let z = &mut x; 
}
```

## 生命周期

### 概念

这个是专门给引用定义的概念，也就是说只有当出现引用的时候才会有生命周期的概念。

生命周期指定了引用的有效范围， Rust 中的每个引用都有一个生命周期，即引用的有效时间。

先看一个通过生命周期避免悬垂引用的例子：

```rust
// 这里显式去标注出生命周期 &'a，两个引用都具有相同的生命周期
fn longest<'a>(s1: &'a str, s2: &'a str) -> &'a str {
    if s1.len() > s2.len() {
        s1
    } else {
        s2
    }
}

fn main() {
    let s1 = String::from("hello");
    let result;
    {
        let s2 = String::from("world");
        // 这里 s2 会报错，s2 存活的时间不够长
        result = longest(&s1, &s2);
    } // s2 在这里就被释放掉了

    // 这里还是有可能会用到 s2 的值，但 s2 提前释放了，所以上面就报错了，上面可能会引起悬垂引用，会出现内存问题
    println!("The longest string is: {}", result);
}

```

那么如何解决这个问题呢？那就是让 s1 和 s2 的存活时间一样就好了，看个例子

```rust
fn longest<'a>(s1: &'a str, s2: &'a str) -> &'a str {
    if s1.len() > s2.len() {
        s1
    } else {
        s2
    }
}

fn main() {
    let s1 = String::from("hello");
    let result;
    // 把 s2 放到了这里
    let s2;
    {
        s2 = String::from("world");
        result = longest(&s1, &s2);
    }
    // 此时 s1 和 s2 都依然有效
    println!("The longest string is: {}", result);
}
```

### 生命周期省略

函数参数或方法参数中的生命周期被称为输入生命周期，而返回的生命周期则被称为输出生命周期。

在没有显示标注的情况下，编译器使用3种规则来计算生命周期。

第一条规则作用在输入生命周期，第二条和第三条规则作用在输出生命周期。

当编译器检查完这 3 条规则后仍无法计算出生命周期时，就会报错。这些规则不但对 fn 定义生效，也对 impl 代码块生效。

1. 每一个引用参数都拥有自己的生命周期。
2. 当只存在一个输入生命周期参数时，这个生命周期会被赋给所有输出生命周期。
3. 当拥有多个输入生命周期参数，而其中一个是 &self 或 &mut self 时，self 的生命周期会被赋给所有输出生命周期。

```rust
// 应用了第一条规则
fn print(s: &str);                                      // 省略
fn print<'a>(s: &'a str);                               // 展开后

// 应用了第一条规则
fn debug(level: usize, s: &str);                        // 省略
fn debug<'a>(level: usize, s: &'a str);                 // 展开后

// 应用了第一、二条规则
fn substr(s: &str, until: usize) -> &str;               // 省略
fn substr<'a>(s: &'a str, until: usize) -> &'a str;     // 展开后

fn get_str() -> &str;                                   // 非法

fn frob(s: &str, t: &str) -> &str;                      // 非法

// 应用了第一、二条规则
// impl 中的方法，带有 self
fn get_mut(&mut self) -> &mut T;                        // 省略
fn get_mut<'a>(&'a mut self) -> &'a mut T;              // 展开后

// 应用了第一、三条规则
// impl 中的方法，带有 self
fn args<T: ToCStr>(&mut self, args: &[T]) -> &mut Command                  // 省略
fn args<'a, 'b, T: ToCStr>(&'a mut self, args: &'b [T]) -> &'a mut Command // 展开后

// 应用了第一、二条规则
// impl 中的构造函数
fn new(buf: &mut [u8]) -> BufWriter;                    // 省略
fn new(buf: &mut [u8]) -> BufWriter<'_>;                // 省略
fn new<'a>(buf: &'a mut [u8]) -> BufWriter<'a>          // 展开后
```

## 总结

以上就是对于 Rust 的所有权、内存、生命周期的一个小结，它们是保证 Rust 内存安全的基石，想学好 Rust 必须要掌握这几个点。当然这是比较基础的知识，其实也有一些别的方式去编写出类似于任何别的语言的内存分配方式，比如 Rust 的智能指针，这会在后面的文章去说了。