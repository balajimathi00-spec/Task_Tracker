import { useEffect, useMemo, useState } from 'react'
import { taskApi } from './api.js'

const emptyForm = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'MEDIUM',
  status: 'PENDING'
}

const statusLabels = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed'
}

const priorityLabels = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' }

function prettyDate(value) {
  if (!value) return 'No due date'
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

function App() {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadTasks() {
    setLoading(true)
    setError('')
    try {
      setTasks(await taskApi.getAll())
    } catch (err) {
      setError(`${err.message}. Check that MySQL and the Spring Boot backend are running.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTasks() }, [])

  const counts = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    progress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length
  }), [tasks])

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase()
    return tasks.filter(task => {
      const matchesFilter = filter === 'ALL' || task.status === filter
      const matchesSearch = !query ||
        task.title.toLowerCase().includes(query) ||
        (task.description || '').toLowerCase().includes(query)
      return matchesFilter && matchesSearch
    })
  }, [tasks, filter, search])

  function changeField(event) {
    const { name, value } = event.target
    setForm(current => ({ ...current, [name]: value }))
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  async function submitForm(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate || null,
        description: form.description.trim()
      }
      if (editingId) {
        await taskApi.update(editingId, payload)
        setNotice('Task updated successfully.')
      } else {
        await taskApi.create(payload)
        setNotice('Task created successfully.')
      }
      resetForm()
      await loadTasks()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function startEdit(task) {
    setEditingId(task.id)
    setForm({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate || '',
      priority: task.priority || 'MEDIUM',
      status: task.status || 'PENDING'
    })
    setNotice('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return
    setError('')
    setNotice('')
    try {
      await taskApi.remove(task.id)
      setTasks(current => current.filter(item => item.id !== task.id))
      if (editingId === task.id) resetForm()
      setNotice('Task deleted.')
    } catch (err) {
      setError(err.message)
    }
  }

  async function quickStatus(task, status) {
    try {
      await taskApi.update(task.id, {
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate || null,
        priority: task.priority,
        status
      })
      setTasks(current => current.map(item => item.id === task.id ? { ...item, status } : item))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="TaskTrack home">
          <span className="brand-mark">✓</span>
          <span>Task<span className="brand-accent">Track</span></span>
        </a>
        <span className="topbar-label">YOUR PERSONAL WORKSPACE</span>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">PLAN SMARTER · GET MORE DONE</p>
          <h1>Make room for <span>great work.</span></h1>
          <p className="welcome-copy">Keep your tasks organized and your day moving forward.</p>
        </div>
        <div className="welcome-icon" aria-hidden="true">✦</div>
      </section>

      <section className="stats-grid" aria-label="Task summary">
        <StatCard label="Total tasks" value={counts.total} symbol="▤" tone="blue" />
        <StatCard label="Pending" value={counts.pending} symbol="◷" tone="amber" />
        <StatCard label="In progress" value={counts.progress} symbol="↗" tone="purple" />
        <StatCard label="Completed" value={counts.completed} symbol="✓" tone="green" />
      </section>

      {(error || notice) && (
        <div className={`message ${error ? 'message-error' : 'message-success'}`} role="status">
          {error || notice}
          <button className="message-close" onClick={() => { setError(''); setNotice('') }} aria-label="Dismiss message">×</button>
        </div>
      )}

      <section className="content-grid">
        <aside className="panel form-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{editingId ? 'MAKE CHANGES' : 'CAPTURE AN IDEA'}</p>
              <h2>{editingId ? 'Edit task' : 'Create a task'}</h2>
            </div>
            <span className="heading-icon">{editingId ? '✎' : '+'}</span>
          </div>
          <form onSubmit={submitForm} className="task-form">
            <label htmlFor="title">Task title <span className="required">*</span></label>
            <input id="title" name="title" value={form.title} onChange={changeField}
              placeholder="e.g. Finish project report" maxLength="120" required />
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={form.description}
              onChange={changeField} placeholder="Add a few details..." rows="3" maxLength="1000" />
            <div className="form-row">
              <div>
                <label htmlFor="dueDate">Due date</label>
                <input id="dueDate" type="date" name="dueDate" value={form.dueDate} onChange={changeField} />
              </div>
              <div>
                <label htmlFor="priority">Priority</label>
                <select id="priority" name="priority" value={form.priority} onChange={changeField}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={form.status} onChange={changeField}>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Save changes' : '+ Add task'}
            </button>
            {editingId && <button className="secondary-button" type="button" onClick={resetForm}>Cancel editing</button>}
          </form>
          <p className="form-footnote"><span>*</span> Required field</p>
        </aside>

        <section className="panel list-panel">
          <div className="list-heading">
            <div>
              <p className="eyebrow">YOUR WORK, AT A GLANCE</p>
              <h2>My tasks <span className="task-count">{visibleTasks.length}</span></h2>
            </div>
            <span className="list-decoration" aria-hidden="true">▦</span>
          </div>

          <div className="toolbar">
            <div className="search-wrap">
              <span aria-hidden="true">⌕</span>
              <input aria-label="Search tasks" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search tasks..." />
            </div>
            <select aria-label="Filter tasks by status" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="ALL">All tasks</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {loading ? (
            <div className="empty-state"><div className="empty-symbol">◌</div><h3>Loading tasks...</h3></div>
          ) : visibleTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-symbol">☷</div>
              <h3>{tasks.length ? 'No matching tasks' : 'A fresh start'}</h3>
              <p>{tasks.length ? 'Try another search or filter.' : 'Add your first task using the form to get started.'}</p>
            </div>
          ) : (
            <div className="task-list">
              {visibleTasks.map(task => (
                <article className={`task-item ${task.status === 'COMPLETED' ? 'task-is-complete' : ''}`} key={task.id}>
                  <button className={`completion-check ${task.status === 'COMPLETED' ? 'checked' : ''}`}
                    onClick={() => quickStatus(task, task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED')}
                    aria-label={task.status === 'COMPLETED' ? 'Mark as pending' : 'Mark as completed'}>
                    {task.status === 'COMPLETED' ? '✓' : ''}
                  </button>
                  <div className="task-main">
                    <div className="task-title-row">
                      <h3>{task.title}</h3>
                      <span className={`priority priority-${(task.priority || 'MEDIUM').toLowerCase()}`}>
                        {priorityLabels[task.priority] || 'Medium'}
                      </span>
                    </div>
                    {task.description && <p className="task-description">{task.description}</p>}
                    <div className="task-meta">
                      <span className="due-date">▦ {prettyDate(task.dueDate)}</span>
                      <span className={`status status-${task.status.toLowerCase()}`}>{statusLabels[task.status] || task.status}</span>
                    </div>
                  </div>
                  <div className="task-actions">
                    <button className="icon-button" onClick={() => startEdit(task)} aria-label={`Edit ${task.title}`} title="Edit">✎</button>
                    <button className="icon-button delete-button" onClick={() => deleteTask(task)} aria-label={`Delete ${task.title}`} title="Delete">×</button>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="list-footer">
            <span>Stay focused. One task at a time.</span>
            <button onClick={loadTasks} className="refresh-button" disabled={loading}>↻ Refresh</button>
          </div>
        </section>
      </section>

      <footer className="footer">Made for better days <span>✦</span> TaskTrack</footer>
    </main>
  )
}

function StatCard({ label, value, symbol, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-symbol ${tone}`}>{symbol}</div>
      <div><p>{label}</p><strong>{value}</strong></div>
    </article>
  )
}

export default App
