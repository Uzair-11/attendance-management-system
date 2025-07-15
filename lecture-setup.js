document.addEventListener('DOMContentLoaded', () => {
  const studentInfo = document.getElementById('student-info');
  const dateInput = document.getElementById('date');
  const subjectSelect = document.getElementById('subject');
  const totalInput = document.getElementById('total');
  const attendedInput = document.getElementById('attended');
  const addLectureBtn = document.getElementById('add-lecture');
  const saveLecturesBtn = document.getElementById('save-lectures');
  const showSummaryBtn = document.getElementById('show-summary');
  const lectureList = document.getElementById('lecture-list');
  const logoutBtn = document.getElementById('logoutBtn');

  // ✅ Access Control
  const loggedIn = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!loggedIn) {
    alert('Please login first.');
    window.location.href = 'login.html';
  }

  // ✅ Load selected student
  const selectedStudent = JSON.parse(localStorage.getItem('selectedStudent'));
  if (!selectedStudent) {
    alert('No student selected. Please select a student first.');
    window.location.href = 'student-info.html';
    return;
  }

  studentInfo.innerHTML = `
    <p><strong>Student:</strong> ${selectedStudent.name} (${selectedStudent.enrollment})</p>
    <p>Roll No: ${selectedStudent.rollno} | Division: ${selectedStudent.division} | Contact: ${selectedStudent.contact}</p>
  `;

  // ✅ Default date = today
  dateInput.valueAsDate = new Date();

  let lectures = [];

  addLectureBtn.addEventListener('click', () => {
    const date = dateInput.value;
    const subject = subjectSelect.value;
    const total = parseInt(totalInput.value);
    const attended = parseInt(attendedInput.value);

    if (!date) {
      alert('Please select a date.');
      return;
    }

    if (!subject) {
      alert('Please select a subject.');
      return;
    }

    if (isNaN(total) || total < 1) {
      alert('Total lectures must be at least 1.');
      return;
    }

    if (isNaN(attended) || attended < 0) {
      alert('Lectures attended cannot be negative.');
      return;
    }

    if (attended > total) {
      alert('Lectures attended cannot exceed total lectures.');
      return;
    }

    // ✅ Check for duplicate: same date & subject
    const duplicateIndex = lectures.findIndex(
      lec => lec.date === date && lec.subject === subject
    );

    if (duplicateIndex !== -1) {
      lectures[duplicateIndex] = { date, subject, total, attended };
      alert(`Updated lecture for ${subject} on ${date}.`);
    } else {
      lectures.push({ date, subject, total, attended });
      alert(`Added lecture for ${subject} on ${date}.`);
    }

    renderLectures();
  });

  function renderLectures() {
    lectureList.innerHTML = '';

    lectures.forEach((lecture, index) => {
      const div = document.createElement('div');
      div.className = 'lecture-item';
      div.innerHTML = `
        ${lecture.date} — ${lecture.subject}: ${lecture.attended}/${lecture.total}
        <span data-index="${index}" style="cursor:pointer; color:red; margin-left:10px;">&times;</span>
      `;
      lectureList.appendChild(div);
    });

    document.querySelectorAll('.lecture-item span').forEach(span => {
      span.addEventListener('click', e => {
        const index = e.target.getAttribute('data-index');
        lectures.splice(index, 1);
        renderLectures();
      });
    });
  }

  saveLecturesBtn.addEventListener('click', () => {
    if (lectures.length === 0) {
      alert('Please add at least one lecture.');
      return;
    }

    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];

    attendanceRecords.push({
      student: selectedStudent,
      lectures: lectures
    });

    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));

    alert('Lectures saved successfully!');
    window.location.href = 'attendance-records.html';
  });

  showSummaryBtn.addEventListener('click', () => {
    alert('Summary feature will be implemented soon!');
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
