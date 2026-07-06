import { useState } from 'react';
import type { Language, Task } from '../types';
import { t } from '../utils/languageUtils';

interface Props {
  language: Language;
  tasks: Task[];
  note: string;
  onTasks: (tasks: Task[]) => void;
  onNote: (note: string) => void;
}

export default function ProductivityTasks({ language, tasks, note, onTasks, onNote }: Props) {
  const [text, setText] = useState('');
  const addTask = () => {
    if (!text.trim()) return;
    onTasks([...tasks, { id: crypto.randomUUID(), text: text.trim(), completed: false, createdAt: new Date().toISOString() }]);
    setText('');
  };
  return (
    <section className="glass card">
      <div className="section-title"><span>✅ {t(language, 'tasks')}</span></div>
      <div className="input-row">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} placeholder={language === 'bn' ? 'নতুন কাজ' : 'Add a task'} />
        <button onClick={addTask}>+</button>
      </div>
      <div className="task-list">
        {tasks.length === 0 && <small>{language === 'bn' ? 'আজকের জন্য কোনো কাজ নেই।' : 'No focus tasks yet.'}</small>}
        {tasks.map((task) => (
          <div key={task.id} className="task-row">
            <label>
              <input type="checkbox" checked={task.completed} onChange={() => onTasks(tasks.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item))} />
              <span className={task.completed ? 'done' : ''}>{task.text}</span>
            </label>
            <button onClick={() => onTasks(tasks.filter((item) => item.id !== task.id))}>×</button>
          </div>
        ))}
      </div>
      <textarea value={note} onChange={(e) => onNote(e.target.value)} placeholder={t(language, 'note')} />
    </section>
  );
}
