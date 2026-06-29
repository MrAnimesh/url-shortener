import { FormEvent, useEffect, useState } from "react";
import HeaderDashboard from "../components/HeaderDashboard";
import axiosInstance from "../utility/axiosInstance";

const permissionOptions = [
  ["CREATE_SHORT_URL", "Create standard short URLs"],
  ["DELETE_URL", "Delete short URLs"],
  ["ACTIVATION", "Activate and deactivate URLs"],
  ["CUSTOM_ALIAS", "Create custom aliases"],
  ["SET_PASSWORD", "Set and reset URL passwords"],
  ["SET_EXPIRE", "Reset URL expiration"],
  ["SET_EXPIRE_TIME", "Set URL expiration time"],
  ["SET_MAX_CLICK", "Set maximum click limits"],
  ["REPLACE", "Replace a URL source"],
  ["QR_CODE", "Generate and view QR codes"],
  ["PREMIUM", "Reserved premium entitlement"],
] as const;

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface Worker {
  id: number;
  username: string;
  email: string;
  mobileNo: string | null;
  role: string;
  enabled: boolean;
  createdBy: number;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

interface WorkerFormValues {
  username: string;
  email: string;
  mobileNo: string;
  password: string;
}

interface WorkerFormProps {
  worker: Worker | null;
  saving: boolean;
  onCancel: () => void;
  onSave: (values: WorkerFormValues) => Promise<void>;
}

const WorkerForm = ({ worker, saving, onCancel, onSave }: WorkerFormProps) => {
  const [values, setValues] = useState<WorkerFormValues>({
    username: worker?.username ?? "",
    email: worker?.email ?? "",
    mobileNo: worker?.mobileNo ?? "",
    password: "",
  });

  const updateValue = (field: keyof WorkerFormValues, value: string) => {
    setValues(current => ({ ...current, [field]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await onSave(values);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-5 text-xl font-semibold text-gray-900">
          {worker ? "Edit worker" : "Create worker"}
        </h2>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Name
            <input required value={values.username} onChange={event => updateValue("username", event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Email
            <input required type="email" value={values.email} onChange={event => updateValue("email", event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Mobile number
            <input value={values.mobileNo} onChange={event => updateValue("mobileNo", event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
          </label>
          {!worker && (
            <label className="block text-sm font-medium text-gray-700">
              Initial password
              <input required minLength={8} type="password" value={values.password}
                onChange={event => updateValue("password", event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
            </label>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={saving}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700">Cancel</button>
          <button type="submit" disabled={saving}
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-60">
            {saving ? "Saving…" : "Save worker"}
          </button>
        </div>
      </form>
    </div>
  );
};

interface PermissionEditorProps {
  worker: Worker;
  saving: boolean;
  onCancel: () => void;
  onSave: (permissions: string[]) => Promise<void>;
}

const PermissionEditor = ({ worker, saving, onCancel, onSave }: PermissionEditorProps) => {
  const [selected, setSelected] = useState<string[]>(worker.permissions.map(permission => permission.name));

  const togglePermission = (permission: string) => {
    setSelected(current => current.includes(permission)
      ? current.filter(value => value !== permission)
      : [...current, permission]);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900">Permissions for {worker.username}</h2>
        <p className="mt-1 text-sm text-gray-500">Premium actions also require the admin account to be premium.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {permissionOptions.map(([name, description]) => (
            <label key={name} className="flex cursor-pointer gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
              <input type="checkbox" checked={selected.includes(name)} onChange={() => togglePermission(name)}
                className="mt-1 h-4 w-4" />
              <span><span className="block text-sm font-medium text-gray-800">{name}</span>
                <span className="text-xs text-gray-500">{description}</span></span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={saving}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700">Cancel</button>
          <button type="button" onClick={() => void onSave(selected)} disabled={saving}
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-60">
            {saving ? "Saving…" : "Save permissions"}
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkerManagement = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [permissionWorker, setPermissionWorker] = useState<Worker | null>(null);

  const loadWorkers = async () => {
    try {
      const response = await axiosInstance.get<Worker[]>("/admin/workers");
      setWorkers(response.data);
    } catch (error) {
      console.error("Unable to load workers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWorkers();
  }, []);

  const saveWorker = async (values: WorkerFormValues) => {
    setSaving(true);
    try {
      if (editingWorker) {
        await axiosInstance.put(`/admin/workers/${editingWorker.id}`, {
          username: values.username, email: values.email, mobileNo: values.mobileNo || null,
        });
      } else {
        await axiosInstance.post("/admin/workers", {
          username: values.username, email: values.email,
          mobileNo: values.mobileNo || null, password: values.password,
        });
      }
      setEditingWorker(null);
      setShowCreateForm(false);
      await loadWorkers();
    } catch (error) {
      console.error("Unable to save worker", error);
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (worker: Worker, enabled: boolean) => {
    try {
      console.log("Clicked: ",worker.id, "Enabled: ",enabled)
      await axiosInstance.patch(`/admin/workers/${worker.id}/status`, { enabled });
      console.log("Called");
      
      await loadWorkers();
    } catch (error) {
      console.error("Unable to update worker status", error);
    }
  };

  const disableWorker = async (worker: Worker) => {
    if (!window.confirm(`Disable ${worker.username}?`)) return;
    try {
      await axiosInstance.delete(`/admin/workers/${worker.id}`);
      await loadWorkers();
    } catch (error) {
      console.error("Unable to disable worker", error);
    }
  };

  const savePermissions = async (permissions: string[]) => {
    if (!permissionWorker) return;
    setSaving(true);
    try {
      await axiosInstance.put(`/admin/workers/${permissionWorker.id}/permissions`, { permissions });
      setPermissionWorker(null);
      await loadWorkers();
    } catch (error) {
      console.error("Unable to update permissions", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderDashboard />
      <main className="mx-auto max-w-7xl px-4 py-28">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><h1 className="text-2xl font-bold text-gray-900">Worker management</h1>
            <p className="text-sm text-gray-600">Create workers and control the URL actions available to them.</p></div>
          <button onClick={() => setShowCreateForm(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">Create worker</button>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow">
          {loading ? <div className="p-8 text-center text-gray-500">Loading workers…</div>
            : workers.length === 0 ? <div className="p-8 text-center text-gray-500">No workers have been created.</div>
            : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr>
                {['Worker', 'Status', 'Permissions', 'Created', 'Actions'].map(heading =>
                  <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">{heading}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {workers.map(worker => <tr key={worker.id}>
                  <td className="px-5 py-4"><div className="font-medium text-gray-900">{worker.username}</div>
                    <div className="text-sm text-gray-500">{worker.email}</div>
                    {worker.mobileNo && <div className="text-xs text-gray-400">{worker.mobileNo}</div>}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${worker.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {worker.enabled ? 'Enabled' : 'Disabled'}</span></td>
                  <td className="px-5 py-4"><div className="flex max-w-md flex-wrap gap-1">
                    {worker.permissions.length === 0 ? <span className="text-sm text-gray-400">None</span>
                      : worker.permissions.map(permission => <span key={permission.id} className="rounded bg-indigo-50 px-2 py-1 text-xs text-indigo-700">{permission.name}</span>)}
                  </div></td>
                  <td className="px-5 py-4 text-sm text-gray-500">{new Date(worker.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4"><div className="flex flex-wrap gap-2 text-sm">
                    <button onClick={() => setEditingWorker(worker)} className="text-indigo-600 hover:text-indigo-800">Edit</button>
                    <button onClick={() => setPermissionWorker(worker)} className="text-indigo-600 hover:text-indigo-800">Permissions</button>
                    <button onClick={() => void changeStatus(worker, !worker.enabled)} className="text-amber-600 hover:text-amber-800">
                      {worker.enabled ? 'Disable' : 'Enable'}</button>
                    {worker.enabled && <button onClick={() => void disableWorker(worker)} className="text-red-600 hover:text-red-800">Delete</button>}
                  </div></td>
                </tr>)}
              </tbody>
            </table></div>}
        </div>
      </main>

      {(showCreateForm || editingWorker) && <WorkerForm worker={editingWorker} saving={saving}
        onCancel={() => { setShowCreateForm(false); setEditingWorker(null); }} onSave={saveWorker} />}
      {permissionWorker && <PermissionEditor worker={permissionWorker} saving={saving}
        onCancel={() => setPermissionWorker(null)} onSave={savePermissions} />}
    </div>
  );
};

export default WorkerManagement;
