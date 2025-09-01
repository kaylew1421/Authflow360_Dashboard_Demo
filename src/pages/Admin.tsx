const Admin = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">👨‍💼 Admin Dashboard</h1>

      <section className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">📊 Analytics</h2>
        <p className="text-gray-700">View platform usage, authorization volume, and trends.</p>
      </section>

      <section className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">👤 Account Management</h2>
        <p className="text-gray-700">Update profile info, roles, and user access levels.</p>
      </section>

      <section className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">🛠 Admin Tools</h2>
        <p className="text-gray-700">Set up teams, manage permissions, and system configurations.</p>
      </section>
    </div>
  );
};

export default Admin;
