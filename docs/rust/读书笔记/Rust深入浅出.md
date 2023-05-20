# Rust 深入浅出

主要记录一些可能会常用的东西

## 控制台打印

```rust
fn main() {
  println!("{}", 1); // 默认用法,打印Display
  println!("{:p}", &0); // 指针
  println!("{:b}", 15); // 二进制
  println!("{:e}", 10000f32); // 科学计数(小写)
  println!("{:E}", 10000f32); // 科学计数(大写)
  println!("{:?}", "test"); // 打印Debug
  println!("{:#?}", ("test1", "test2")); // 带换行和缩进的Debug打印
  println!("{a} {b} {b}", a = "x", b = "y"); // 命名参数
}
```

## 解构变量

```rust
// 解构并声明 a,b 可变变量
let (mut a, mut b) = (1, 2);
// 解构结构体
let Point { x: ref a, y: ref b} = p;
```

## 类型推导

```rust
fn main() {
  let player_scores = [
    ("Jack", 20), ("Jane", 23), ("Jill", 18), ("John", 19),
  ];
  // players 是动态数组,内部成员的类型没有指定,交给编译器自动推导
  let players : Vec<_> = player_scores
  .iter()
  .map(|&(player, _score)| {
    player
  })
  .collect();

  println!("{:?}", players);
}
```

## 静态变量

在程序的整个生命周期都存在。生命周期为 'static, Rust 中唯一的声明全局变量的方法

```rust
static GLOBAL: i32 = 0;

fn main() {
  //全局变量必须声明的时候初始化,因为全局变量可以写到函数外面,被任意一个函数使用
  static G1 : i32 = 3;
  println!("{}", G1);
  //可变全局变量无论读写都必须用 unsafe修饰
  static mut G2 : i32 = 4;
  unsafe {
    G2 = 5;
    println!("{}", G2);
  }
  //全局变量的内存不是分配在当前函数栈上,函数退出的时候,并不会销毁全局变量占用的内存空间,程序退出才会
}
```

Rust 不允许在 main 函数之前或者之后执行自己的代码。比较复杂的 static 变量的初始化需要使用 lazy 方式，在第一次使用的时候再初始化。可以使用 lazy_static 库

## 浮点类型

这个类型是比较特殊的，所以单独记下来，Rust 提供了基于 IEEE 754-2008 标准的浮点类型（JS 也是）
在标准库中，有一个 std：：num：：FpCategory 枚举，表示了浮点
数可能的状态：

```rust
enum FpCategory {
  Nan, // not a number
  Infinite, // 无穷状态
  Zero,  // 0
  Subnormal, // 这种状态下的浮点数表示精度比Normal状态下的精度低一点
  Normal, // 正常状态
}
```

```rust
fn main() {
  let x = 1.0f32 / 0.0;
  let y = 0.0f32 / 0.0;
  // inf NaN
  println!("{} {}", x, y);
}
```

NaN 这个特殊值不具备“全序”的特点

```rust
fn main() {
  let nan = std::f32::NAN;
  // false false false
  println!("{} {} {}", nan < nan, nan > nan, nan == nan);
}
```

因为 NaN 的存在，浮点数是不具备“全序关系”，这牵扯到 PartialOrd 和 Ord 这两个 trait

## 指针

常用指针

| 类型      | 简介                                                        |
| --------- | ----------------------------------------------------------- |
| Box\<T>   | 指向类型 T，具有所有权，有权释放内存的指针                  |
| &T        | 指向类型 T 的借用指针，也称为引用，无权释放内存，无权写数据 |
| &mut T    | 指向类型 T 的可变借用指针，无权释放内存，有权写数据         |
| \*const T | 指向类型 T 的只读裸指针，没有生命周期信息，无权写数据       |
| \*mut T   | 指向类型 T 的可读写裸指针，没有生命周期信息，有权写数据     |

另外还可以自己实现除标准库之外的智能指针，常见的标准库指针

| 类型       | 简介                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| Rc\<T>     | 指向类型 T 的引用计数指针，共享所有权，线程不安全                      |
| Arc\<T>    | 指向类型 T 的原子型引用计数指针，共享所有权，线程安全                  |
| Cow<'a, T> | Clone-on-write，写时复制指针。可能是引用指针，也可能是具有所有权的指针 |

## 类型转换

Rust 不提供隐式类型转换，需要用 as 显式声明，以用来防止潜在的 bug

有些时候需要多次 as 才能转成功

```rust
fn main() {
  let i = 42;
  // 先转为 *const i32,再转为 *mut i32
  let p = &i as *const i32 as *mut i32;
  println!("{:p}", p);
}
```

## newType

可以让我们在一 个类型的基础上创建一个新的类型

使用 tuple struct 做包装，创造了一个全新的类型，它跟被包装的类型不 能发生隐式类型转换

```rust
fn main() {
  struct Inches(i32);
  fn f1(value : Inches) {}
  fn f2(value : i32) {}
  let v : i32 = 0;
  f1(v); // 编译不通过,'mismatched types'
  f2(v);
}
```

类型别名，I 和 i32 实际还是同一个类型，只是起了个另外的名字

```rust
type I = i32
```

## 循环

```RUST
std：：ops：：RangeFrom 代表只有起始没有结束的范围，语法为
start..，含义是 [start，+∞）；
```

```RUST
std：：ops：：RangeTo代表没有起始只有结束的范围，语法
为..end，对有符号数的含义是（-∞，end），对无符号数的含义是[0，end）；
```

```RUST
std：：ops：：RangeFull代表没有上下限制的范围，语法为..，对
有符号数的含义是（-∞，+∞），对无符号数的含义是[0，+∞）。
```

```RUST
std：：ops：：RangeInclusive，语法为start..=end，含义是[start，
end]
```

```RUST
std：：ops：：RangeToInclusive，语法为..=end，对有符号数的含
义是（-∞，end]，对无符号数的含义是[0，end]
```

左闭右开： ..
左闭右闭: ..=

```rust
for i in 1..10 {}
```
