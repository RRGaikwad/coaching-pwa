import { useState, FormEvent } from "react";
import { User, Store, DisplayCategory } from "../../data/store";

interface Props { user: User; }

export default function Teachers({ user: _user }: Props) {
  const [teachers, setTeachers] = useState<User[]>(Store.getUsers().filter(u => u.role === "teacher"));
  const [showAdd, setShowAdd] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    password: "",
    subject: "",
    displayCategory: "11th" as DisplayCategory,
  });

  const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Social Science"];
  const categories: DisplayCategory[] = ["11th", "12th", "Gap"];

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const teacher: User = {
      ...newTeacher,
      id: `u_${Date.now()}`,
      role: "teacher",
    };
    Store.addUser(teacher);
    setTeachers([...teachers, teacher]);
    setShowAdd(false);
    setNewTeacher({ name: "", email: "", password: "", subject: "", displayCategory: "11th" });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      Store.deleteUser(id);
      setTeachers(teachers.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Teacher Management</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          + Add Teacher
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-semibold mb-4">Add New Teacher</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input
                  required
                  type="text"
                  value={newTeacher.name}
                  onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={newTeacher.email}
                  onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                <input
                  required
                  type="password"
                  value={newTeacher.password}
                  onChange={e => setNewTeacher({ ...newTeacher, password: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                <select
                  required
                  value={newTeacher.subject}
                  onChange={e => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Assigned Category</label>
                <select
                  required
                  value={newTeacher.displayCategory}
                  onChange={e => setNewTeacher({ ...newTeacher, displayCategory: e.target.value as DisplayCategory })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
              >
                Save Teacher
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Teacher</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-medium">
                      {t.subject}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium">
                      {t.displayCategory}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-red-400 hover:text-red-600 transition p-1"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {teachers.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              No teachers found. Click "Add Teacher" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
