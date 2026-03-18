import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './simple.css'

// 添加全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
  console.error('错误位置:', event.filename, '行:', event.lineno, '列:', event.colno);
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason);
  event.preventDefault();
});

console.log('应用开始加载...');

try {
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  console.log('React根节点创建成功');
  root.render(<App />);
  console.log('应用渲染成功');
} catch (error) {
  console.error('应用初始化错误:', error);
}