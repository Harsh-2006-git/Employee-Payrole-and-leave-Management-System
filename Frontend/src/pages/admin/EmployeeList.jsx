import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MoreVertical, UserPlus, Mail, Phone, MapPin, Calendar, Wallet, Edit, List, ArrowLeft, ShieldCheck, Users, Briefcase, TrendingUp } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add' | 'edit'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const confirmAction = (message, onConfirm) => {
    toast((t) => (
      <div style={{ padding: '8px' }}>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#fff', fontWeight: 600 }}>{message}</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { onConfirm(); toast.dismiss(t.id); }}
            style={{ background: '#6366f1', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 5000, style: { background: '#0f172a' } });
  };

  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    department: '',
    designation: '',
    dateOfJoining: '',
    employeeId: '',
    bankDetails: {
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      branchName: ''
    },
    salaryStructure: {
      basic: 0,
      hra: 0,
      conveyance: 0,
      medical: 0,
      special: 0,
      allowances: 0,
      deductions: {
        pf: 0,
        professionalTax: 0,
        tds: 0,
        tax: 0
      }
    },
    leaveBalance: {
      casual: 12,
      sick: 10,
      paid: 15,
      unpaid: 0,
      maternity: 0,
      paternity: 0,
      bereavement: 0,
      compensatory: 0
    }
  });

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees/all');
      setEmployees(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? Number(value) : value;

    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 3) {
        const [parent, child, subchild] = parts;
        setNewEmployee(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subchild]: processedValue
            }
          }
        }));
      } else if (parts.length === 2) {
        const [parent, child] = parts;
        setNewEmployee(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: processedValue
          }
        }));
      }
    } else {
      setNewEmployee(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/employees', newEmployee);
      toast.success('Employee added successfully');
      setActiveTab('list');
      fetchEmployees();
      setNewEmployee({
        firstName: '', lastName: '', email: '', phoneNumber: '', address: '',
        department: '', designation: '', dateOfJoining: '', employeeId: '',
        bankDetails: { accountNumber: '', bankName: '', ifscCode: '', branchName: '' },
        salaryStructure: { basic: 0, hra: 0, conveyance: 0, medical: 0, special: 0, allowances: 0, deductions: { pf: 0, professionalTax: 0, tds: 0, tax: 0 } },
        leaveBalance: { casual: 12, sick: 10, paid: 15, unpaid: 0, maternity: 0, paternity: 0, bereavement: 0, compensatory: 0 }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding employee');
    }
  };

  const handleEditClick = (emp) => {
    setEditingEmployee({
      ...emp,
      dateOfJoining: emp.dateOfJoining ? emp.dateOfJoining.split('T')[0] : ''
    });
    setActiveTab('edit');
  };

  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? Number(value) : value;

    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 3) {
        const [parent, child, subchild] = parts;
        setEditingEmployee(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subchild]: processedValue
            }
          }
        }));
      } else if (parts.length === 2) {
        const [parent, child] = parts;
        setEditingEmployee(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: processedValue
          }
        }));
      }
    } else {
      setEditingEmployee(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { user, _id, createdAt, updatedAt, __v, ...payload } = editingEmployee;
      await api.put(`/employees/${_id}`, payload);
      toast.success('Employee profile updated');
      setActiveTab('list');
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating employee');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="employee-management">
      <div className="page-header">
        <div className="header-info">
          <h1>Employee Management</h1>
          <p>{activeTab === 'list' ? 'Manage employee records and information' : activeTab === 'add' ? 'Register a new employee' : 'Modify employee profile details'}</p>
        </div>

        <div className="tab-shifter">
          <button
            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <List size={18} />
            Staff List
          </button>
          <button
            className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <UserPlus size={18} />
            Add Employee
          </button>
          {activeTab === 'edit' && (
            <button className="tab-btn active">
              <Edit size={18} />
              Edit Mode
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="tab-content"
          >
            <div className="glass-card table-card">
              <div className="table-header">
                <div className="search-box">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>ID</th>
                      <th>Department</th>
                      <th>Leave Balance</th>
                      <th>Basic Salary</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp, index) => (
                      <motion.tr
                        key={emp._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedEmployee(emp)}
                      >
                        <td>
                          <div className="user-cell">
                            <motion.img
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              src="/default-avatar.png"
                              alt="Profile"
                              className="user-img"
                            />
                            <div>
                              <div className="user-name">{emp.firstName} {emp.lastName}</div>
                              <div className="user-email">{emp.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="id-badge">{emp.employeeId}</span></td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#475569' }}>{emp.department}</div>
                        </td>
                        <td>
                          <div className="leave-pill-group">
                            <motion.span whileHover={{ y: -4 }} className="lp-casual">{emp.leaveBalance.casual}</motion.span>
                            <motion.span whileHover={{ y: -4 }} className="lp-sick">{emp.leaveBalance.sick}</motion.span>
                            <motion.span whileHover={{ y: -4 }} className="lp-paid">{emp.leaveBalance.paid}</motion.span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, color: '#1e293b' }}>${emp.salaryStructure.basic.toLocaleString()}</div>
                        </td>
                        <td>
                          <span className={`status-tag ${emp.status.toLowerCase()}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="action-btn-circle"
                              onClick={(e) => { e.stopPropagation(); handleEditClick(emp); }}
                            >
                              <Edit size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="action-btn-circle"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'add' && (
          <motion.div
            key="add"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="tab-content"
          >
            <div className="form-container">
              <div className="form-title-section">
                <div className="header-text">
                  <div className="badge-pill">Administration</div>
                  <h2>Add New Employee</h2>
                  <p>Fill in the details below to create a new employee profile.</p>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                confirmAction(`Authorize creation of record for ${newEmployee.firstName} ${newEmployee.lastName}?`, () => {
                  handleAddSubmit(e);
                });
              }} className="professional-form">

                {/* Section 1: Personal Information */}
                <div className="form-card-section">
                  <div className="section-intro">
                    <div className="intro-icon-sphere"><Users size={20} /></div>
                    <div className="intro-text">
                      <h4>Personal Information</h4>
                      <p>Full name and basic contact information</p>
                    </div>
                  </div>
                  <div className="onboarding-grid">
                    <div className="input-field-cool">
                      <label>First Name</label>
                      <input required placeholder="e.g. Alexander" name="firstName" value={newEmployee.firstName} onChange={handleAddChange} />
                    </div>
                    <div className="input-field-cool">
                      <label>Last Name</label>
                      <input required placeholder="e.g. Morgan" name="lastName" value={newEmployee.lastName} onChange={handleAddChange} />
                    </div>
                    <div className="input-field-cool">
                      <label>Email Address</label>
                      <input required type="email" placeholder="alex.m@organization.com" name="email" value={newEmployee.email} onChange={handleAddChange} />
                      <span className="input-hint">Used for SSO authentication access</span>
                    </div>
                    <div className="input-field-cool">
                      <label>Phone Number</label>
                      <input placeholder="+1 (555) 000-0000" name="phoneNumber" value={newEmployee.phoneNumber} onChange={handleAddChange} />
                    </div>
                    <div className="input-field-cool full-span">
                      <label>Address</label>
                      <input placeholder="Street address, City, State" name="address" value={newEmployee.address} onChange={handleAddChange} />
                    </div>
                  </div>
                </div>

                {/* Section 2: Work Information */}
                <div className="form-card-section">
                  <div className="section-intro">
                    <div className="intro-icon-sphere"><Briefcase size={20} /></div>
                    <div className="intro-text">
                      <h4>Work Details</h4>
                      <p>Employee role and department assignment</p>
                    </div>
                  </div>
                  <div className="onboarding-grid">
                    <div className="input-field-cool">
                      <label>Employee ID</label>
                      <input
                        readOnly
                        className="readonly-input"
                        name="employeeId"
                        value={newEmployee.employeeId || (newEmployee.employeeId = `EMP-${Math.floor(100000 + Math.random() * 900000)}`)}
                      />
                    </div>
                    <div className="input-field-cool">
                      <label>Department</label>
                      <select required name="department" value={newEmployee.department} onChange={handleAddChange}>
                        <option value="">Select Department</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Product">Product</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Operation">Operation</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">Human Resources</option>
                      </select>
                    </div>
                    <div className="input-field-cool">
                      <label>Designation / Role</label>
                      <input required placeholder="e.g. Senior Architect" name="designation" value={newEmployee.designation} onChange={handleAddChange} />
                    </div>
                    <div className="input-field-cool">
                      <label>Joining Date</label>
                      <input required type="date" name="dateOfJoining" value={newEmployee.dateOfJoining} onChange={handleAddChange} />
                    </div>
                  </div>
                </div>

                {/* Section 3: Bank Details */}
                <div className="form-card-section">
                  <div className="section-intro">
                    <div className="intro-icon-sphere"><Wallet size={20} /></div>
                    <div className="intro-text">
                      <h4>Bank Account Details</h4>
                      <p>Account details for salary payments</p>
                    </div>
                  </div>
                  <div className="onboarding-grid">
                    <div className="input-field-cool">
                      <label>Account Number</label>
                      <input placeholder="0000 0000 0000" name="bankDetails.accountNumber" value={newEmployee.bankDetails.accountNumber} onChange={handleAddChange} />
                    </div>
                    <div className="input-field-cool">
                      <label>Bank Name</label>
                      <input placeholder="Bank of America / Chase" name="bankDetails.bankName" value={newEmployee.bankDetails.bankName} onChange={handleAddChange} />
                    </div>
                    <div className="input-field-cool">
                      <label>IFSC Code</label>
                      <input placeholder="BANKUS33XXX" name="bankDetails.ifscCode" value={newEmployee.bankDetails.ifscCode} onChange={handleAddChange} />
                    </div>
                    <div className="input-field-cool">
                      <label>Branch Name</label>
                      <input placeholder="Main Street Branch" name="bankDetails.branchName" value={newEmployee.bankDetails.branchName} onChange={handleAddChange} />
                    </div>
                  </div>
                </div>

                {/* Section 4: Salary & Leaves */}
                <div className="form-card-section">
                  <div className="section-intro">
                    <div className="intro-icon-sphere"><TrendingUp size={20} /></div>
                    <div className="intro-text">
                      <h4>Salary & Leave Balance</h4>
                      <p>Detailed pay components and annual leave allocations</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#6366f1', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Earnings</h5>
                    <div className="onboarding-grid">
                      <div className="input-field-cool">
                        <label>Monthly Basic ($)</label>
                        <input required type="number" name="salaryStructure.basic" value={newEmployee.salaryStructure.basic} onChange={handleAddChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>HRA ($)</label>
                        <input required type="number" name="salaryStructure.hra" value={newEmployee.salaryStructure.hra} onChange={handleAddChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Conveyance ($)</label>
                        <input type="number" name="salaryStructure.conveyance" value={newEmployee.salaryStructure.conveyance} onChange={handleAddChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Medical Allowance ($)</label>
                        <input type="number" name="salaryStructure.medical" value={newEmployee.salaryStructure.medical} onChange={handleAddChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Special Allowance ($)</label>
                        <input type="number" name="salaryStructure.special" value={newEmployee.salaryStructure.special} onChange={handleAddChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Other Allowances ($)</label>
                        <input type="number" name="salaryStructure.allowances" value={newEmployee.salaryStructure.allowances} onChange={handleAddChange} />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#f43f5e', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deductions</h5>
                    <div className="onboarding-grid">
                      <div className="input-field-cool">
                        <label>PF Deduction ($)</label>
                        <input required type="number" name="salaryStructure.deductions.pf" value={newEmployee.salaryStructure.deductions.pf} onChange={handleAddChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Professional Tax ($)</label>
                        <input type="number" name="salaryStructure.deductions.professionalTax" value={newEmployee.salaryStructure.deductions.professionalTax} onChange={handleAddChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>TDS ($)</label>
                        <input type="number" name="salaryStructure.deductions.tds" value={newEmployee.salaryStructure.deductions.tds} onChange={handleAddChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Income Tax ($)</label>
                        <input required type="number" name="salaryStructure.deductions.tax" value={newEmployee.salaryStructure.deductions.tax} onChange={handleAddChange} />
                      </div>
                    </div>
                  </div>

                  <div className="input-field-divider full-span" style={{ margin: '32px 0' }}></div>

                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#10b981', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Annual Leave Allocation</h5>
                    <div className="onboarding-grid">
                      <div className="input-field-cool">
                        <label>Casual Leaves</label>
                        <input required type="number" name="leaveBalance.casual" value={newEmployee.leaveBalance.casual} onChange={handleAddChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Sick Leaves</label>
                        <input required type="number" name="leaveBalance.sick" value={newEmployee.leaveBalance.sick} onChange={handleAddChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Paid Leaves</label>
                        <input required type="number" name="leaveBalance.paid" value={newEmployee.leaveBalance.paid} onChange={handleAddChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Unpaid Leaves</label>
                        <input required type="number" name="leaveBalance.unpaid" value={newEmployee.leaveBalance.unpaid} onChange={handleAddChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Maternity Leaves</label>
                        <input required type="number" name="leaveBalance.maternity" value={newEmployee.leaveBalance.maternity} onChange={handleAddChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Paternity Leaves</label>
                        <input required type="number" name="leaveBalance.paternity" value={newEmployee.leaveBalance.paternity} onChange={handleAddChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Bereavement Leaves</label>
                        <input required type="number" name="leaveBalance.bereavement" value={newEmployee.leaveBalance.bereavement} onChange={handleAddChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Compensatory Offs</label>
                        <input required type="number" name="leaveBalance.compensatory" value={newEmployee.leaveBalance.compensatory} onChange={handleAddChange} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="onboarding-actions">
                  <button type="button" className="btn-secondary-large" onClick={() => setActiveTab('list')}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-large" disabled={loading}>
                    {loading ? 'Adding Employee...' : 'Add Employee'}
                    <UserPlus size={18} />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'edit' && editingEmployee && (
          <motion.div
            key="edit"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="tab-content"
          >
            <div className="form-container">
              <div className="form-title-section">
                <button className="back-btn-simple" onClick={() => setActiveTab('list')}>
                  <ArrowLeft size={16} /> Back to List
                </button>
                <div className="profile-header-group">
                  <img src="/default-avatar.png" alt="Profile" className="header-avatar" />
                  <div className="header-text">
                    <div className="badge-pill">Edit Record</div>
                    <h2>{editingEmployee.firstName} {editingEmployee.lastName}</h2>
                    <p>Updating profile for ID: {editingEmployee.employeeId}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleEditSubmit} className="professional-form">
                {/* Section 1: Personal Information */}
                <div className="form-card-section">
                  <div className="section-intro">
                    <div className="intro-icon-sphere"><Users size={20} /></div>
                    <div className="intro-text">
                      <h4>Personal Information</h4>
                      <p>Full name and basic contact information</p>
                    </div>
                  </div>
                  <div className="onboarding-grid">
                    <div className="input-field-cool">
                      <label>First Name</label>
                      <input required name="firstName" value={editingEmployee.firstName || ''} onChange={handleEditChange} />
                    </div>
                    <div className="input-field-cool">
                      <label>Last Name</label>
                      <input required name="lastName" value={editingEmployee.lastName || ''} onChange={handleEditChange} />
                    </div>
                    <div className="input-field-cool">
                      <label>Email Address</label>
                      <input required type="email" name="email" value={editingEmployee.email || (editingEmployee.user?.email || '')} readOnly className="readonly-input" />
                    </div>
                    <div className="input-field-cool">
                      <label>Phone Number</label>
                      <input name="phoneNumber" value={editingEmployee.phoneNumber || ''} onChange={handleEditChange} />
                    </div>
                    <div className="input-field-cool full-span">
                      <label>Address</label>
                      <input name="address" value={editingEmployee.address || ''} onChange={handleEditChange} />
                    </div>
                  </div>
                </div>

                {/* Section 2: Work Information */}
                <div className="form-card-section">
                  <div className="section-intro">
                    <div className="intro-icon-sphere"><Briefcase size={20} /></div>
                    <div className="intro-text">
                      <h4>Work Details</h4>
                      <p>Employee role and department assignment</p>
                    </div>
                  </div>
                  <div className="onboarding-grid">
                    <div className="input-field-cool">
                      <label>Status</label>
                      <select name="status" value={editingEmployee.status} onChange={handleEditChange}>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="ON_LEAVE">ON_LEAVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                    <div className="input-field-cool">
                      <label>Department</label>
                      <select required name="department" value={editingEmployee.department} onChange={handleEditChange}>
                        <option value="Engineering">Engineering</option>
                        <option value="Product">Product</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Operation">Operation</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">Human Resources</option>
                      </select>
                    </div>
                    <div className="input-field-cool">
                      <label>Designation / Role</label>
                      <input required name="designation" value={editingEmployee.designation || ''} onChange={handleEditChange} />
                    </div>
                    <div className="input-field-cool">
                      <label>Joining Date</label>
                      <input required type="date" name="dateOfJoining" value={editingEmployee.dateOfJoining || ''} onChange={handleEditChange} />
                    </div>
                  </div>
                </div>

                {/* Section 3: Bank Details */}
                <div className="form-card-section">
                  <div className="section-intro">
                    <div className="intro-icon-sphere"><Wallet size={20} /></div>
                    <div className="intro-text">
                      <h4>Bank Account Details</h4>
                      <p>Account details for salary payments</p>
                    </div>
                  </div>
                  <div className="onboarding-grid">
                    <div className="input-field-cool">
                      <label>Account Number</label>
                      <input name="bankDetails.accountNumber" value={editingEmployee.bankDetails?.accountNumber || ''} onChange={handleEditChange} />
                    </div>
                    <div className="input-field-cool">
                      <label>Bank Name</label>
                      <input name="bankDetails.bankName" value={editingEmployee.bankDetails?.bankName || ''} onChange={handleEditChange} />
                    </div>
                    <div className="input-field-cool">
                      <label>IFSC Code</label>
                      <input name="bankDetails.ifscCode" value={editingEmployee.bankDetails?.ifscCode || ''} onChange={handleEditChange} />
                    </div>
                    <div className="input-field-cool">
                      <label>Branch Name</label>
                      <input name="bankDetails.branchName" value={editingEmployee.bankDetails?.branchName || ''} onChange={handleEditChange} />
                    </div>
                  </div>
                </div>

                {/* Section 4: Salary & Leaves */}
                <div className="form-card-section">
                  <div className="section-intro">
                    <div className="intro-icon-sphere"><TrendingUp size={20} /></div>
                    <div className="intro-text">
                      <h4>Salary & Leave Balance</h4>
                      <p>Detailed pay components and annual leave allocations</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#6366f1', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Earnings</h5>
                    <div className="onboarding-grid">
                      <div className="input-field-cool">
                        <label>Monthly Basic ($)</label>
                        <input required type="number" name="salaryStructure.basic" value={editingEmployee.salaryStructure?.basic || 0} onChange={handleEditChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>HRA ($)</label>
                        <input required type="number" name="salaryStructure.hra" value={editingEmployee.salaryStructure?.hra || 0} onChange={handleEditChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Conveyance ($)</label>
                        <input type="number" name="salaryStructure.conveyance" value={editingEmployee.salaryStructure?.conveyance || 0} onChange={handleEditChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Medical Allowance ($)</label>
                        <input type="number" name="salaryStructure.medical" value={editingEmployee.salaryStructure?.medical || 0} onChange={handleEditChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Special Allowance ($)</label>
                        <input type="number" name="salaryStructure.special" value={editingEmployee.salaryStructure?.special || 0} onChange={handleEditChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Other Allowances ($)</label>
                        <input type="number" name="salaryStructure.allowances" value={editingEmployee.salaryStructure?.allowances || 0} onChange={handleEditChange} />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#f43f5e', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deductions</h5>
                    <div className="onboarding-grid">
                      <div className="input-field-cool">
                        <label>PF Deduction ($)</label>
                        <input required type="number" name="salaryStructure.deductions.pf" value={editingEmployee.salaryStructure?.deductions?.pf || 0} onChange={handleEditChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Professional Tax ($)</label>
                        <input type="number" name="salaryStructure.deductions.professionalTax" value={editingEmployee.salaryStructure?.deductions?.professionalTax || 0} onChange={handleEditChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>TDS ($)</label>
                        <input type="number" name="salaryStructure.deductions.tds" value={editingEmployee.salaryStructure?.deductions?.tds || 0} onChange={handleEditChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Income Tax ($)</label>
                        <input required type="number" name="salaryStructure.deductions.tax" value={editingEmployee.salaryStructure?.deductions?.tax || 0} onChange={handleEditChange} />
                      </div>
                    </div>
                  </div>

                  <div className="input-field-divider full-span" style={{ margin: '32px 0' }}></div>

                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#10b981', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Annual Leave Allocation</h5>
                    <div className="onboarding-grid">
                      <div className="input-field-cool">
                        <label>Casual Leaves</label>
                        <input required type="number" name="leaveBalance.casual" value={editingEmployee.leaveBalance?.casual || 0} onChange={handleEditChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Sick Leaves</label>
                        <input required type="number" name="leaveBalance.sick" value={editingEmployee.leaveBalance?.sick || 0} onChange={handleEditChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Paid Leaves</label>
                        <input required type="number" name="leaveBalance.paid" value={editingEmployee.leaveBalance?.paid || 0} onChange={handleEditChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Unpaid Leaves</label>
                        <input required type="number" name="leaveBalance.unpaid" value={editingEmployee.leaveBalance?.unpaid || 0} onChange={handleEditChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Maternity Leaves</label>
                        <input required type="number" name="leaveBalance.maternity" value={editingEmployee.leaveBalance?.maternity || 0} onChange={handleEditChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Paternity Leaves</label>
                        <input required type="number" name="leaveBalance.paternity" value={editingEmployee.leaveBalance?.paternity || 0} onChange={handleEditChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Bereavement Leaves</label>
                        <input required type="number" name="leaveBalance.bereavement" value={editingEmployee.leaveBalance?.bereavement || 0} onChange={handleEditChange} />
                      </div>
                      <div className="input-field-cool">
                        <label>Compensatory Offs</label>
                        <input required type="number" name="leaveBalance.compensatory" value={editingEmployee.leaveBalance?.compensatory || 0} onChange={handleEditChange} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="onboarding-actions">
                  <button type="button" className="btn-secondary-large" onClick={() => setActiveTab('list')}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-large">
                    Update Employee Profile
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal kept for quick viewing */}
      <AnimatePresence>
        {selectedEmployee && activeTab === 'list' && (
          <div className="modal-overlay" onClick={() => setSelectedEmployee(null)}>
            <motion.div
              className="glass-card detail-view"
              onClick={e => e.stopPropagation()}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
            >
              <button className="close-panel" onClick={() => setSelectedEmployee(null)}>&times;</button>
              <div className="panel-header">
                <img src="/default-avatar.png" alt="Profile" />
                <h2>{selectedEmployee.firstName} {selectedEmployee.lastName}</h2>
                <span className="id-tag">{selectedEmployee.employeeId}</span>
              </div>
              <div className="panel-content">
                <div className="info-row"><label>Email</label><span>{selectedEmployee.user.email}</span></div>
                <div className="info-row"><label>Dept</label><span>{selectedEmployee.department}</span></div>
                <div className="info-row"><label>Role</label><span>{selectedEmployee.designation}</span></div>
                <div className="info-row"><label>Status</label><span className={`status-${selectedEmployee.status.toLowerCase()}`}>{selectedEmployee.status}</span></div>
                <div className="divider"></div>
                <h4>Leave Allocation</h4>
                <div className="leave-grid">
                  <div className="l-item"><span>{selectedEmployee.leaveBalance.casual}</span><p>Casual</p></div>
                  <div className="l-item"><span>{selectedEmployee.leaveBalance.sick}</span><p>Sick</p></div>
                  <div className="l-item"><span>{selectedEmployee.leaveBalance.paid}</span><p>Paid</p></div>
                </div>
              </div>
              <div className="panel-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => { handleEditClick(selectedEmployee); setSelectedEmployee(null); }}>
                  <Edit size={16} /> Edit Profile
                </button>
                <button className="btn-outline" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#1e293b', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                  onClick={() => { window.location.href = `/attendance/${selectedEmployee.employeeId}`; setSelectedEmployee(null); }}>
                  <Calendar size={16} /> View Attendance
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .employee-management { display: flex; flex-direction: column; gap: 32px; padding-bottom: 40px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        
        .tab-shifter { 
          display: flex; background: #f1f5f9; padding: 6px; border-radius: 14px; gap: 4px;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }
        .tab-btn {
          display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px;
          font-size: 14px; font-weight: 700; color: #64748b; transition: all 0.2s;
        }
        .tab-btn.active { background: white; color: #6366f1; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .tab-btn:hover:not(.active) { color: #1e293b; background: rgba(255,255,255,0.5); }

        .table-card { padding: 0; overflow: hidden; border: 1px solid rgba(255,255,255,0.4); }
        .table-header { padding: 32px; border-bottom: 1px solid #f1f5f9; background: rgba(248, 250, 252, 0.5); }
        
        .search-box { 
          position: relative; max-width: 400px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .search-box:focus-within { transform: translateX(10px); }
        .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; transition: color 0.3s; }
        .search-box:focus-within .search-icon { color: #6366f1; }
        .search-box input { 
          width: 100%; padding: 14px 14px 14px 48px; border: 1px solid #e2e8f0; border-radius: 16px; 
          font-family: inherit; font-size: 14px; background: white; transition: all 0.3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .search-box input:focus { 
          outline: none; border-color: #6366f1; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.1);
        }

        .table-wrapper { overflow-x: auto; }
        .custom-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .custom-table th { 
          text-align: left; padding: 20px 24px; font-size: 11px; font-weight: 800; 
          color: #64748b; text-transform: uppercase; letter-spacing: 1px;
          border-bottom: 1px solid #f1f5f9; background: #fcfcfd;
        }
        .custom-table td { padding: 20px 24px; border-bottom: 1px solid #f8fafc; transition: all 0.2s; }
        
        .custom-table tr { cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .custom-table tbody tr:hover { 
          background: #f8faff; transform: scale(1.005) translateX(5px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.05);
          z-index: 10; position: relative;
        }

        .user-cell { display: flex; align-items: center; gap: 16px; }
        .user-img { width: 44px; height: 44px; border-radius: 14px; object-fit: cover; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .user-name { font-weight: 700; color: #1e293b; font-size: 15px; margin-bottom: 2px; }
        .user-email { font-size: 13px; color: #94a3b8; font-weight: 500; }

        .id-badge { 
          background: #f1f5f9; color: #475569; padding: 6px 12px; border-radius: 8px; 
          font-size: 12px; font-weight: 800; font-family: 'JetBrains Mono', monospace;
        }

        .leave-pill-group { display: flex; gap: 8px; }
        .leave-pill-group span { 
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          border-radius: 10px; font-size: 11px; font-weight: 800; color: white;
          transition: transform 0.2s;
        }
        .leave-pill-group span:hover { transform: translateY(-3px); }
        .lp-casual { background: linear-gradient(135deg, #60a5fa, #3b82f6); box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2); }
        .lp-sick { background: linear-gradient(135deg, #f87171, #ef4444); box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2); }
        .lp-paid { background: linear-gradient(135deg, #34d399, #10b981); box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); }

        .status-tag { 
          padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; 
          text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 6px;
        }
        .status-tag.active { background: #ecfdf5; color: #059669; border: 1px solid #d1fae5; }
        .status-tag.active::before { content: ''; width: 6px; height: 6px; background: #059669; border-radius: 50%; animation: pulse 2s infinite; }
        .status-tag.on_leave { background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; }
        .status-tag.inactive { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }

        @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(5, 150, 105, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
        }

        .action-buttons { display: flex; gap: 10px; }
        .action-btn-circle { 
          width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
          background: white; border: 1px solid #e2e8f0; color: #64748b; transition: all 0.2s;
        }
        .action-btn-circle:hover { 
          background: #6366f1; color: white; border-color: #6366f1; 
          transform: rotate(15deg); box-shadow: 0 6px 12px rgba(99, 102, 241, 0.2);
        }

        .action-btn-circle:hover { 
          background: #6366f1; color: white; border-color: #6366f1; 
          transform: rotate(15deg); box-shadow: 0 6px 12px rgba(99, 102, 241, 0.2);
        }

        /* Detail Side Panel */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.1); backdrop-filter: blur(2px); z-index: 2000; display: flex; justify-content: flex-end; }
        .detail-view { 
          width: 400px; height: 100%; border-radius: 0; border-left: 1px solid #e2e8f0; 
          padding: 40px; display: flex; flex-direction: column; position: relative;
        }
        .close-panel { position: absolute; top: 20px; right: 20px; font-size: 24px; color: #94a3b8; }
        .panel-header { text-align: center; margin-bottom: 40px; }
        .panel-header img { width: 100px; height: 100px; border-radius: 30px; margin-bottom: 16px; border: 4px solid white; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .panel-header h2 { font-size: 20px; margin-bottom: 8px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 16px; }
        .info-row label { color: #64748b; font-size: 14px; }
        .info-row span { font-weight: 700; color: #1e293b; }
        .leave-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; }
        .l-item { background: #f8fafc; padding: 12px; border-radius: 12px; text-align: center; }
        .l-item span { display: block; font-size: 20px; font-weight: 800; color: #6366f1; }
        .l-item p { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }

        .badge-pill { 
          padding: 6px 16px; background: #e0e7ff; color: #4338ca; 
          border-radius: 100px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
        }

        .form-card-section { 
          background: white; border-radius: 24px; padding: 40px; margin-bottom: 24px;
          border: 1px solid rgba(226, 232, 240, 0.6); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.02);
        }
        .section-intro { display: flex; gap: 20px; margin-bottom: 32px; }
        .intro-icon-sphere { 
          width: 48px; height: 48px; background: #f8faff; color: #6366f1; border-radius: 16px;
          display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px rgba(99,102,241,0.05);
        }
        .intro-text h4 { font-size: 18px; color: #1e293b; margin-bottom: 4px; }
        .intro-text p { color: #94a3b8; font-size: 14px; }

        .onboarding-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; }
        .input-field-cool { display: flex; flex-direction: column; gap: 10px; }
        .input-field-cool label { font-size: 13px; font-weight: 800; color: #475569; letter-spacing: 0.3px; }
        .input-field-cool input, .input-field-cool select { 
          background: #f8fafc; border: 1.5px solid #e2e8f0; padding: 14px 18px; border-radius: 14px;
          font-family: inherit; font-size: 15px; color: #1e293b; transition: all 0.3s;
        }
        .input-field-cool input:focus { 
          background: white; border-color: #6366f1; outline: none; box-shadow: 0 0 0 4px rgba(99,102,241,0.08);
        }
        .input-field-cool .readonly-input { background: #f1f5f9; color: #64748b; font-weight: 700; cursor: not-allowed; }
        .input-hint { font-size: 11px; color: #94a3b8; font-weight: 600; }
        .full-span { grid-column: span 2; }
        .input-field-divider { height: 1px; background: #f1f5f9; margin: 8px 0; }

        .price-input { position: relative; }
        .price-input span { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-weight: 700; color: #94a3b8; }
        .price-input input { padding-left: 36px !important; }

        .onboarding-actions { 
          display: flex; justify-content: flex-end; gap: 16px; padding-top: 20px;
        }
        .btn-secondary-large { 
          padding: 16px 32px; border-radius: 16px; font-weight: 800; font-size: 15px;
          color: #64748b; background: #f8fafc; border: 1.5px solid #e2e8f0; transition: all 0.2s;
          cursor: pointer;
        }
        .btn-secondary-large:hover { background: #f1f5f9; color: #1e293b; }
        .btn-primary-large { 
          padding: 16px 36px; border-radius: 16px; font-weight: 800; font-size: 15px;
          color: white; background: #1e293b; display: flex; align-items: center; gap: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: none;
          cursor: pointer;
        }
        .btn-primary-large:hover { transform: translateY(-3px); box-shadow: 0 15px 30px -10px rgba(0,0,0,0.3); background: #000; }
        .btn-primary-large:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .form-container { max-width: 1000px; margin: 0 auto; padding-bottom: 60px; }
        .form-title-section { 
          display: flex; flex-direction: column; gap: 20px;
          margin-bottom: 40px; border-bottom: 1px solid #e2e8f0; padding-bottom: 32px;
        }
        .profile-header-group { display: flex; align-items: center; gap: 24px; }
        .header-avatar { width: 80px; height: 80px; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .back-btn-simple { 
          display: flex; align-items: center; gap: 8px; background: none; border: none; 
          color: #64748b; font-weight: 700; font-size: 14px; cursor: pointer; padding: 0; width: fit-content;
        }
        .back-btn-simple:hover { color: #6366f1; }
      `}</style>
    </div >
  );
};

export default EmployeeList;
