document.addEventListener('DOMContentLoaded', () => {
  const recordsList = document.getElementById('records-list');
  const searchEnrollment = document.getElementById('search-enrollment');
  const searchStudentBtn = document.getElementById('search-student');
  const exportCsvBtn = document.getElementById('export-csv');
  const logoutBtn = document.getElementById('logoutBtn');

  const loggedIn = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!loggedIn) {
    alert('Please login first.');
    window.location.href = 'login.html';
  }

  let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
  let currentStudentRecords = [];
  let currentStudent = null;

  function renderStudentRecords(enrollment) {
    const grouped = {};
    attendanceRecords.forEach(record => {
      if (record.student.enrollment === enrollment) {
        if (!grouped[enrollment]) {
          grouped[enrollment] = {
            student: record.student,
            lectures: []
          };
        }
        grouped[enrollment].lectures = grouped[enrollment].lectures.concat(record.lectures);
      }
    });

    recordsList.innerHTML = '';

    if (!grouped[enrollment]) {
      recordsList.innerHTML = '<p>No records found for this student.</p>';
      currentStudentRecords = [];
      currentStudent = null;
      return;
    }

    const group = grouped[enrollment];
    currentStudentRecords = group.lectures;
    currentStudent = group.student;

    const studentDiv = document.createElement('div');
    studentDiv.className = 'record-item';
    studentDiv.innerHTML = `
      <h3>Student: ${group.student.name} (${group.student.enrollment})</h3>
      <p>Roll No: ${group.student.rollno} | Division: ${group.student.division} | Contact: ${group.student.contact}</p>
      <hr>
    `;

    const table = document.createElement('table');
    table.className = 'attendance-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Date</th>
          <th>Subject</th>
          <th>Total</th>
          <th>Attended</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    group.lectures.sort((a, b) => new Date(a.date) - new Date(b.date));

    group.lectures.forEach((lec, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${lec.date}</td>
        <td>${lec.subject}</td>
        <td>${lec.total}</td>
        <td>${lec.attended}</td>
        <td><button class="danger-btn" data-index="${index}">Delete</button></td>
      `;
      tbody.appendChild(row);
    });

    studentDiv.appendChild(table);
    recordsList.appendChild(studentDiv);

    // Attach Delete Handlers
    tbody.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        if (confirm('Are you sure you want to delete this lecture record?')) {
          deleteLecture(index);
        }
      });
    });
  }

  function deleteLecture(index) {
    // Remove lecture from the local current records
    const lecToDelete = currentStudentRecords[index];

    // Remove from global attendanceRecords
    attendanceRecords.forEach(record => {
      if (record.student.enrollment === currentStudent.enrollment) {
        record.lectures = record.lectures.filter(
          lec => !(lec.date === lecToDelete.date && lec.subject === lecToDelete.subject)
        );
      }
    });

    // Remove empty records
    attendanceRecords = attendanceRecords.filter(record => record.lectures.length > 0);

    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));

    // Re-render
    renderStudentRecords(currentStudent.enrollment);
  }

  searchStudentBtn.addEventListener('click', () => {
    const enrollment = searchEnrollment.value.trim();
    if (!enrollment) {
      alert('Please enter an enrollment number.');
      return;
    }
    renderStudentRecords(enrollment);
  });

  exportCsvBtn.addEventListener('click', () => {
    if (currentStudentRecords.length === 0) {
      alert('No student records loaded to export.');
      return;
    }

    const rows = [["Date", "Subject", "Total", "Attended"]];
    currentStudentRecords.forEach(lec => {
      rows.push([lec.date, lec.subject, lec.total, lec.attended]);
    });

    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `attendance_${searchEnrollment.value.trim()}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
