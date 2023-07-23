import "../requestIdleCallbackPolyfill";

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child !== "object" ? createTextElement(child) : child;
      }),
    },
  };
}

function createTextElement(text) {
  return {
    type: "HostText",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// 排除children属性
const isProperty = (key) => key !== "children";
// 下一个需要处理的额fiber节点
let workInProgress = null;
// fiber root
let workInprogressRoot = null;

class AReactDomRoot {
  // fiber根节点
  _internalRoot = null;
  constructor(container) {
    this.container = container;
    this._internalRoot = {
      current: null,
      containerInfo: container,
    };
  }

  render(element) {
    this._internalRoot.current = {
      alternate: {
        stateNode: this._internalRoot.containerInfo,
        props: {
          children: [element],
        },
      },
    };
    workInprogressRoot = this._internalRoot;
    workInProgress = workInprogressRoot.current.alternate;
    window.requestIdleCallback(() => {
      workLoop();
    });
  }
}

function performUnitOfWork(fiber) {
  // 处理当前fiber：创建dom，设置props，插入当前dom到parent
  // 如果当前fiber不存在stateNode ，则创建
  if (!fiber.stateNode) {
    fiber.stateNode =
      fiber.type === "HostText"
        ? document.createTextNode("")
        : document.createElement(fiber.type);
    Object.keys(fiber.props)
      .filter(isProperty)
      .forEach((key) => {
        fiber.stateNode[key] = fiber.props[key];
      });
  }

  if (fiber.return) {
    fiber.return.stateNode.appendChild(fiber.stateNode);
  }
  // 初始化children fiber
  // 上一个兄弟节点
  let preSibling = null;
  fiber.props.children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      stateNode: null,
      props: child.props,
      return: fiber,
    };
    // 第一个节点是fiber的子节点
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      // 剩下的节点是上个兄弟节点的兄弟节点
      preSibling.sibling = newFiber;
    }
    preSibling = newFiber;
  });
  // 返回下一个需要处理的fiber
  return getNextFiber(fiber);
}

function getNextFiber(fiber) {
  // 遍历顺序 children、sibling、return并查找下一个sibling
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    } else {
      nextFiber = nextFiber.return;
    }
    return null;
  }
}

// 只要workInProgress存在，不断地执行下一个节点
function workLoop() {
  while (workInProgress) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}

function createRoot(container) {
  return new AReactDomRoot(container);
}

// react官方的测试方法：在callback执行结束后再resolve
function act(callback) {
  callback();
  return new Promise((resolve) => {
    function loop() {
      if (workInProgress) {
        window.requestIdleCallback(loop);
      } else {
        resolve();
      }
    }
    loop();
  });
}

export default { createElement, createRoot, act };
