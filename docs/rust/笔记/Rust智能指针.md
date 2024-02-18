# 学这么久 Rust 还不会智能指针？
# 简介

前面的文章我们说过，Rust 是一门以内存安全著称的系统级编程语言。那么它除了上篇文章我们提到的使用所有权、生命周期、借用这些概念来保证内存安全以外，另一个就是智能指针了，智能指针是 Rust 中管理内存和资源的关键特性之一。Rust 不同于 JavaScript，它不依赖运行时的垃圾收集器来管理内存，而是使用智能指针来确保在编译时就避免了内存错误和并发问题。接下来让我们看看智能指针是个啥玩意儿吧👇

## 与普通引用的比较

上一篇文章里我们提到过 “借用” 这个概念，在 Rust 中，常规引用仅仅 “借用” 数据，而不拥有它。这意味着在引用有效期内，数据不能被丢弃。相比之下，智能指针则拥有它们所指向的数据。一旦智能指针离开作用域，它会负责清理管理的数据。这类似于 JS 中的变量在离开作用域时，垃圾回收器回收对应值所占的内存。

## 扩展能力

Rust 智能指针不仅存储内存地址，还可以附加有元数据和额外的一些能力。

比如说，`Rc<T>` 这个智能指针具有引用计数功能，这允许数据有多个所有者，而不像普通的 Rust 变量只能拥有一个所有者；而 `RefCell<T>` 提供了内部可变性特性，即允许在外部不可变的情况下修改数据。待会儿下面我们会解释这几个智能指针和概念，看不懂就先慢慢往下看。

## `Deref` 和 `Drop` 特征

智能指针利用 `Deref` 和 `DerefMut` 特征来提供解引用（dereferencing）能力，即允许智能指针表现得像普通的引用一样。而 `Drop` 特征则定义了智能指针在离开作用域时执行的清理逻辑，相当于 C++ 里面的析构函数，可以做一些资源回收的工作。简单来说，只要实现了 `Deref` 和 `Drop` 特征并提供了额外能力的数据结构，那么它就是智能指针。说了这么多，`talk is cheap, show me the code`，那接下来就看看代码示例吧

## 代码示例

### `Box<T>`

`Box<T>` 是 Rust 中最基本的智能指针，用于在堆上分配空间，并在不再需要时自动释放空间：

```rust
fn main() {
    let stack_data = 10; // 在栈上分配一个整数
    let heap_data = Box::new(10); // 在堆上分配一个整数
    println!("heap_data: {}", heap_data);
} // `heap_data` 离开作用域，内存被释放
```

### `Rc<T>`

`Rc<T>` 是引用计数指针，它是非多线程安全的，它允许一个数据有多个所有者，只有当最后一个所有者离开作用域，数据才被清理：

```rust
use std::rc::Rc;

fn main() {
    let data = Rc::new(5);
    // let other_data = data.clone(); // 增加引用计数，此时 data 的引用是 2
    //  但是建议显式去调用，可读性会强一些，因为普通的 clone 也是直接调用的 .clone() 方法。
    let other_data = Rc::clone(&data);

    println!("当前 data 的引用数：{}", Rc::strong_count(&data)); // 2
    println!("data: {}", data);
    println!("other_data: {}", other_data);
} // 引用计数变为零，内存被释放
```

### Cell<T\>

`Cell<T>` 在运行时检查提供了内部可变性，它是非线程安全的，它适用于实现了 `Copy` 特征的类型，比如整型、浮点型、布尔类型等，它修改值的时候不涉及所有权的转移。

```rust
use std::cell::Cell;

fn main() {
    // 创建一个包装整数的 Cell
    let number = Cell::new(42);

    // 通过 get 方法获取值
    println!("{}", number.get()); // 42

    // 通过 set 方法修改值
    number.set(100);

    // 这里再借用也不会报错
    let ref_num = &number;
    println!("{:?}", ref_num);

    // 再次通过 get 方法获取修改后的值
    println!("{}", number.get()); // 100
}

```

### `RefCell<T>`

`RefCell<T>` 相比于 `Cell` 更加灵活，可以包装任何类型或非 Copy 的类型，并且允许在运行时检查借用规则，如果违反了借用规则（比如在已经存在可变引用的情况下尝试获取另一个可变引用），会导致程序 panic。

```rust
use std::cell::RefCell;

fn main() {
    let data = RefCell::new(5); // 注意没声明 mut
    {
        let mut data_borrow = data.borrow_mut();
        *data_borrow += 1; // 可以修改数据，即使 `data` 是不可变的

        let data_borrow2 = data.borrow_mut(); // 这会在运行时 panic
    }
    println!("Data: {}", data.borrow());
}

```

### `Arc<T>`

`Arc<T>` 是原子引用计数指针，与 `Rc<T>` 相似，但它是专门为多线程环境设计的。其实我们之前对 Rust 的文章介绍中也有用到过这个智能指针，它允许在程序的多个线程之间安全地共享对某个数据的不可变引用。每当你克隆一个 `Arc<T>` 实例时，内部数据的引用计数都会增加，并且只有最后一个引用被丢弃时，数据才会被清理。

```rust
use std::sync::Arc;
use std::thread;

fn main() {
    let data = Arc::new(5);
    let shared_data = Arc::clone(&data);

    thread::spawn(move || {
        println!("子线程中的值: {}", shared_data); // 5
    });

    println!("主线程中的值: {}", data); // 5
}

```

### `Mutex<T>`

`Mutex<T>` 提供互斥锁功能，确保一次只有一个线程可以访问内部数据。这对于保护共享数据在并发访问时的安全至关重要。当你需要对共享数据进行修改时，你必须先锁定 `Mutex<T>`，然后才能访问其内部数据，这个智能指针适用于写入操作相对较频繁的场景。

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    // 创建一个共享的可变数据，包装在 Mutex 中
    let data = Arc::new(Mutex::new(0));

    // 创建多个线程，每个线程将数据加1
    let threads: Vec<_> = (0..5)
        .map(|_| {
            let data = Arc::clone(&data);
            thread::spawn(move || {
                // 获取锁
                let mut lock = data.lock().unwrap();
                // 修改数据
                *lock += 1;
                println!(
                    "Thread {:?}: Data updated to {}",
                    thread::current().id(),
                    *lock
                );
            })
        })
        .collect();

    // 等待所有线程完成
    for thread in threads {
        thread.join().unwrap();
    }

    // 获取最终的数据值
    let final_data = data.lock().unwrap();
    println!("Final Data: {}", *final_data);
}

```

控制台打印

```
Thread ThreadId(2): Data updated to 1
Thread ThreadId(3): Data updated to 2
Thread ThreadId(4): Data updated to 3
Thread ThreadId(5): Data updated to 4
Thread ThreadId(6): Data updated to 5
Final Data: 5
```

### `RwLock<T>`

`RwLock<T>` 是读写锁，允许多个读取者或一个写入者，但这两种访问模式不能同时发生。当数据通常被多个线程读取而很少被修改时，它特别有用，因为它允许多个线程同时读取数据，而不是像 `Mutex<T>` 那样一次只允许一个线程访问，这个指针在高并发读的场景下性能会比 Mutex 好，因为它不需要等待锁释放，它更适用于读多写少的高并发场景。

```rust
use std::sync::{Arc, RwLock};
use std::thread;

fn main() {
    // 创建一个共享的可变数据，包装在 RwLock 中
    let data = Arc::new(RwLock::new(vec![1, 2, 3]));

    // 创建多个读取者线程
    let readers: Vec<_> = (0..5)
        .map(|_| {
            let data = Arc::clone(&data);
            thread::spawn(move || {
                // 读取数据（共享锁）
                let lock = data.read().unwrap();
                println!("Reader {:?}: {:?}", thread::current().id(), *lock);
            })
        })
        .collect();

    // 创建一个写入者线程
    let writer = thread::spawn(move || {
        // 写入数据（独占锁）
        let mut lock = data.write().unwrap();
        lock.push(4);
        println!("Writer: Data updated");
    });

    // 等待所有读取者线程完成
    for reader in readers {
        reader.join().unwrap();
    }

    // 等待写入者线程完成
    writer.join().unwrap();
}

```

控制台打印：

```
Reader ThreadId(2): [1, 2, 3]
Reader ThreadId(3): [1, 2, 3]
Reader ThreadId(4): [1, 2, 3]
Reader ThreadId(5): [1, 2, 3]
Reader ThreadId(6): [1, 2, 3]
Writer: Data updated to [1, 2, 3, 4]
```

## 创建自定义智能指针

你还可以创建自定义的智能指针，通过实现 `Deref` 和 `Drop` 特征来定制行为：

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

## 总结

智能指针是 Rust 中一种提供额外功能的数据结构，其目标是在内存安全和所有权模型的基础上提供更多灵活性。

实现了 `Deref trait` 和 `Drop trait` 并提供了额外能力的数据结构那么它就是智能指针，它是 Rust 保证内存安全的基石，也是 Rust 中最核心的概念之一，其实除了上述的智能指针， Rust 内部还有一些其它的智能指针，比如 `Pin<T>`（异步编程常用，保证一个值不会被移动） 、`Cow<'a, B>`（允许在需要时以引用形式共享数据，以减少不必要的克隆操作，常用于字符串），但是相对于上面几个来说就没那么常用了，这可以以后再了解。

那么到这里，你了解智能指针了嘛？ 学了那么久的 Rust ，到这里有没有一点头绪了？

