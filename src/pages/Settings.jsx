import { FaUsers, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Table from '../components/Table';

export default function Settings() {
  const { role } = useAuth();
  const { teachers, teacherPermissions, updateTeacherPermission } = useData();

  if (role !== 'admin') {
    return <div className="p-6 text-center text-red-600">Access denied. Admin only.</div>;
  }

  const handleTogglePermission = async (teacherUid, currentValue) => {
    try {
      await updateTeacherPermission(teacherUid, !currentValue);
    } catch (error) {
      alert('Failed to update permission.');
    }
  };

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-4xl mx-auto">
      <PageHeader
        title="Settings"
        subtitle="Manage teacher permissions"
      />

      {/* Teacher Permissions */}
      <Card>
        <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaUsers className="text-indigo-600" /> Teacher Permissions
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Grant or revoke edit/delete permissions for each teacher. When enabled, the teacher can edit and delete their own records (students and fees). When disabled, they can only view and add records.
        </p>
        {teachers.length === 0 ? (
          <p className="text-gray-400 text-sm">No teachers registered yet.</p>
        ) : (
          <Table headers={['Email', 'Permission', 'Action']}>
            {teachers.map((teacher) => {
              const canEdit = teacherPermissions[teacher.id] || false;
              return (
                <tr key={teacher.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{teacher.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        canEdit
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {canEdit ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePermission(teacher.id, canEdit)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        canEdit
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {canEdit ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                      {canEdit ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>
    </div>
  );
}