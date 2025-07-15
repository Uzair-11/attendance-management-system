document.addEventListener('DOMContentLoaded', () => {
  const studentForm = document.getElementById('student-form');
  const studentList = document.getElementById('student-list');
  const logoutBtn = document.getElementById('logoutBtn');

  let students = JSON.parse(localStorage.getItem('students')) || [];
  let editIndex = null;

  // ✅ Access Control
  const loggedIn = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!loggedIn) {
    alert('Please login first.');
    window.location.href = 'login.html';
  }

  function renderStudents() {
    studentList.innerHTML = '';

    if (students.length === 0) {
      studentList.innerHTML = `<tr><td colspan="6">No students found. Please add one below.</td></tr>`;
      return;
    }

    students.forEach((student, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${student.enrollment}</td>
        <td>${student.name}</td>
        <td>${student.rollno}</td>
        <td>${student.division}</td>
        <td>${student.contact}</td>
        <td>
          <button class="primary-btn select-btn" data-index="${index}">Select</button>
          <button class="primary-btn edit-btn" data-index="${index}">Edit</button>
          <button class="danger-btn delete-btn" data-index="${index}">Delete</button>
        </td>
      `;
      studentList.appendChild(row);
    });

    // Select handlers
    document.querySelectorAll('.select-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const index = e.target.getAttribute('data-index');
        localStorage.setItem('selectedStudent', JSON.stringify(students[index]));
        alert(`Student "${students[index].name}" selected!`);
        window.location.href = 'lecture-setup.html';
      });
    });

    // Edit handlers
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        editIndex = e.target.getAttribute('data-index');
        const student = students[editIndex];
        document.getElementById('enrollment').value = student.enrollment;
        document.getElementById('name').value = student.name;
        document.getElementById('rollno').value = student.rollno;
        document.getElementById('division').value = student.division;
        document.getElementById('contact').value = student.contact;
      });
    });

    // Delete handlers
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const index = e.target.getAttribute('data-index');
        const confirmDelete = confirm(`Are you sure you want to delete "${students[index].name}"?`);
        if (confirmDelete) {
          students.splice(index, 1);
          localStorage.setItem('students', JSON.stringify(students));
          renderStudents();
        }
      });
    });
  }

  renderStudents();

  studentForm.addEventListener('submit', e => {
    e.preventDefault();

    const enrollment = document.getElementById('enrollment').value.trim();
    const name = document.getElementById('name').value.trim();
    const rollno = document.getElementById('rollno').value.trim();
    const division = document.getElementById('division').value.trim();
    const contact = document.getElementById('contact').value.trim();

    // ✅ Validations
    if (!enrollment || enrollment.length < 4) {
      alert('Enrollment must be at least 4 characters.');
      return;
    }

    if (!/^[A-Za-z\s]+$/.test(name) || name.length < 2) {
      alert('Name must contain only letters and spaces, min 2 characters.');
      return;
    }

    if (!/^\d+$/.test(rollno)) {
      alert('Roll Number must contain digits only.');
      return;
    }

    if (!/^[A-Za-z]{1,2}$/.test(division)) {
      alert('Division must be 1 or 2 letters.');
      return;
    }

    if (!/^\d{10}$/.test(contact)) {
      alert('Contact Number must be exactly 10 digits.');
      return;
    }

    const newStudent = { enrollment, name, rollno, division, contact };

    if (editIndex === null) {
      // ADD new
      students.push(newStudent);
      alert(`Student "${name}" added!`);
    } else {
      // UPDATE existing
      students[editIndex] = newStudent;
      alert(`Student "${name}" updated!`);
      editIndex = null;
    }

    localStorage.setItem('students', JSON.stringify(students));
    renderStudents();
    studentForm.reset();
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
      e.preventDefault();
      localStorage.removeItem('loggedInUser');
      alert('Logged out successfully!');
      window.location.href = 'login.html';
    });
  }
});
