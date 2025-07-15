document.addEventListener('DOMContentLoaded', () => {
  const graphMode = document.getElementById('graph-mode');
  const studentSearchGroup = document.getElementById('student-search-group');
  const searchEnrollment = document.getElementById('search-enrollment');
  const searchStudentBtn = document.getElementById('search-student');
  const exportCsvBtn = document.getElementById('export-csv');
  const logoutBtn = document.getElementById('logoutBtn');
  const ctx = document.getElementById('attendance-chart').getContext('2d');

  // ✅ Access Control
  const loggedIn = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!loggedIn) {
    alert('Please login first.');
    window.location.href = 'login.html';
  }

  const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];

  let chart;

  function renderChart(labels, data, label) {
    if (chart) {
      chart.destroy();
    }
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: data,
          backgroundColor: '#3498db'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  function renderAllStudents() {
    const studentMap = {};

    attendanceRecords.forEach(record => {
      const key = record.student.enrollment;
      if (!studentMap[key]) {
        studentMap[key] = { student: record.student, lectures: [] };
      }
      studentMap[key].lectures = studentMap[key].lectures.concat(record.lectures);
    });

    const labels = [];
    const data = [];

    Object.values(studentMap).forEach(group => {
      const total = group.lectures.reduce((sum, lec) => sum + lec.total, 0);
      const attended = group.lectures.reduce((sum, lec) => sum + lec.attended, 0);
      const percent = total > 0 ? (attended / total) * 100 : 0;
      labels.push(`${group.student.name} (${group.student.enrollment})`);
      data.push(percent.toFixed(2));
    });

    renderChart(labels, data, "Attendance %");
  }

  function renderSingleStudent(enrollment) {
    const studentRecords = attendanceRecords.filter(
      record => record.student.enrollment === enrollment
    );

    if (studentRecords.length === 0) {
      alert('No records found for this student.');
      return;
    }

    let lectures = [];
    studentRecords.forEach(record => lectures = lectures.concat(record.lectures));

    const subjectMap = {};
    lectures.forEach(lec => {
      if (!subjectMap[lec.subject]) {
        subjectMap[lec.subject] = { total: 0, attended: 0 };
      }
      subjectMap[lec.subject].total += lec.total;
      subjectMap[lec.subject].attended += lec.attended;
    });

    const labels = [];
    const data = [];

    Object.entries(subjectMap).forEach(([subject, val]) => {
      const percent = val.total > 0 ? (val.attended / val.total) * 100 : 0;
      labels.push(subject);
      data.push(percent.toFixed(2));
    });

    renderChart(labels, data, `Attendance % for ${enrollment}`);
  }

  graphMode.addEventListener('change', () => {
    if (graphMode.value === 'single') {
      studentSearchGroup.style.display = 'block';
    } else {
      studentSearchGroup.style.display = 'none';
      renderAllStudents();
    }
  });

  searchStudentBtn.addEventListener('click', () => {
    const enrollment = searchEnrollment.value.trim();
    if (!enrollment) {
      alert('Please enter an enrollment number.');
      return;
    }
    renderSingleStudent(enrollment);
  });

  exportCsvBtn.addEventListener('click', () => {
    if (graphMode.value === 'all') {
      exportAllStudentsCSV();
    } else {
      const enrollment = searchEnrollment.value.trim();
      if (!enrollment) {
        alert('Please enter an enrollment number.');
        return;
      }
      exportSingleStudentCSV(enrollment);
    }
  });

  function downloadCSV(filename, rows) {
    const processRow = (row) => {
      return row.map(value => `"${value}"`).join(",");
    };
    const csvContent = rows.map(processRow).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  function exportAllStudentsCSV() {
    const studentMap = {};
    attendanceRecords.forEach(record => {
      const key = record.student.enrollment;
      if (!studentMap[key]) {
        studentMap[key] = { student: record.student, lectures: [] };
      }
      studentMap[key].lectures = studentMap[key].lectures.concat(record.lectures);
    });

    const rows = [["Name", "Enrollment", "Total Lectures", "Attended", "Attendance %"]];
    Object.values(studentMap).forEach(group => {
      const total = group.lectures.reduce((sum, lec) => sum + lec.total, 0);
      const attended = group.lectures.reduce((sum, lec) => sum + lec.attended, 0);
      const percent = total > 0 ? ((attended / total) * 100).toFixed(2) : "0.00";
      rows.push([
        group.student.name,
        group.student.enrollment,
        total,
        attended,
        percent
      ]);
    });

    downloadCSV("attendance_all_students.csv", rows);
  }

  function exportSingleStudentCSV(enrollment) {
    const studentRecords = attendanceRecords.filter(
      record => record.student.enrollment === enrollment
    );
    if (studentRecords.length === 0) {
      alert('No records found for this student.');
      return;
    }
    let lectures = [];
    studentRecords.forEach(record => lectures = lectures.concat(record.lectures));
    const rows = [["Subject", "Total Lectures", "Attended", "Attendance %"]];
    const subjectMap = {};
    lectures.forEach(lec => {
      if (!subjectMap[lec.subject]) {
        subjectMap[lec.subject] = { total: 0, attended: 0 };
      }
      subjectMap[lec.subject].total += lec.total;
      subjectMap[lec.subject].attended += lec.attended;
    });
    Object.entries(subjectMap).forEach(([subject, val]) => {
      const percent = val.total > 0 ? ((val.attended / val.total) * 100).toFixed(2) : "0.00";
      rows.push([subject, val.total, val.attended, percent]);
    });
    downloadCSV(`attendance_${enrollment}.csv`, rows);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
      e.preventDefault();
      localStorage.removeItem('loggedInUser');
      alert('Logged out successfully!');
      window.location.href = 'login.html';
    });
  }

  // Initial render
  renderAllStudents();
});
