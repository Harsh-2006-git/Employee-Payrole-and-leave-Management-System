import Employee from '../models/Employee.js';
import User from '../models/User.js';

class EmployeeService {
    async getAllEmployees() {
        return await Employee.find().populate('user', 'email displayName picture role isActive');
    }

    async getEmployeeById(id) {
        return await Employee.findById(id).populate('user', 'email displayName picture role isActive');
    }

    async getEmployeeByUserId(userId) {
        return await Employee.findOne({ user: userId }).populate('user', 'email displayName picture role isActive');
    }

    async createEmployee(employeeData) {
        // Prevent duplicate employee profiles for the same user
        const existing = await Employee.findOne({ user: employeeData.user });
        if (existing) {
            return await Employee.findByIdAndUpdate(existing._id, employeeData, { new: true });
        }
        return await Employee.create(employeeData);
    }

    async updateEmployee(id, updateData) {
        return await Employee.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }

    async deactivateEmployee(id) {
        const employee = await Employee.findById(id);
        if (!employee) throw new Error('Employee not found');

        await User.findByIdAndUpdate(employee.user, { isActive: false });
        employee.status = 'INACTIVE';
        return await employee.save();
    }

    async updateLeaveBalance(id, leaveType, days) {
        const employee = await Employee.findById(id);
        if (!employee) throw new Error('Employee not found');

        employee.leaveBalance[leaveType.toLowerCase()] -= days;
        return await employee.save();
    }
}

export default new EmployeeService();
