// Cloudflare Worker to handle API requests and KV storage
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCors();
    }
    
    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env, url);
    }
    // Serve static HTML file for all other routes
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>学生选择器应用</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            text-align: center;
            color: #333;
        }
        #app {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        button {
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
        }
        #student-info {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h1>学生选择器应用</h1>
    <div id="app">
        <button id="random-student">随机选择学生</button>
        <button id="save-student">保存学生数据</button>
        <div id="student-info">
            <h3>学生信息</h3>
            <p id="student-name">等待选择...</p>
        </div>
    </div>

    <script>
        // 简单的学生选择器应用
        const randomStudentBtn = document.getElementById('random-student');
        const saveStudentBtn = document.getElementById('save-student');
        const studentNameEl = document.getElementById('student-name');

        // 模拟学生数据
        let students = [];

        // 从API获取学生数据
        async function fetchStudents() {
            try {
                const response = await fetch('/api/students');
                students = await response.json();
                console.log('学生数据:', students);
            } catch (error) {
                console.error('获取学生数据失败:', error);
            }
        }

        // 随机选择学生
        randomStudentBtn.addEventListener('click', async () => {
            if (students.length === 0) {
                await fetchStudents();
            }
            if (students.length > 0) {
                const randomIndex = Math.floor(Math.random() * students.length);
                const selectedStudent = students[randomIndex];
                studentNameEl.textContent = selectedStudent.name + ' (' + selectedStudent.id + ')';
            } else {
                studentNameEl.textContent = '没有学生数据';
            }
        });

        // 保存学生数据
        saveStudentBtn.addEventListener('click', async () => {
            const newStudent = {
                id: Date.now().toString(),
                name: prompt('请输入学生姓名:'),
                class: prompt('请输入学生班级:')
            };
            if (newStudent.name && newStudent.class) {
                try {
                    await fetch('/api/students', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newStudent)
                    });
                    alert('学生数据保存成功');
                    await fetchStudents(); // 重新获取数据
                } catch (error) {
                    console.error('保存学生数据失败:', error);
                    alert('保存失败');
                }
            }
        });

        // 初始化获取学生数据
        fetchStudents();
    </script>
</body>
</html>
    `;
    return new Response(htmlContent, {
        headers: { 'Content-Type': 'text/html' }
    });
  }
};

async function handleApiRequest(request, env, url) {
  const path = url.pathname.substring(4); // Remove '/api' prefix
  
  try {
    switch (path) {
      case '/students':
        if (request.method === 'GET') {
          return handleCors(await getAllStudents(env));
        } else if (request.method === 'POST') {
          const studentData = await request.json();
          return handleCors(await saveStudent(env, studentData));
        }
        break;
        
      case '/students/all':
        if (request.method === 'PUT') {
          const allData = await request.json();
          return handleCors(await saveAllStudents(env, allData));
        } else if (request.method === 'DELETE') {
          return handleCors(await deleteAllStudents(env));
        }
        break;
        
      case '/backup':
        if (request.method === 'GET') {
          return handleCors(await getBackup(env));
        }
        break;
      
      default:
        return handleCors(new Response('Not Found', { status: 404 }));
    }
  } catch (error) {
    return handleCors(new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  
  return handleCors(new Response('Method Not Allowed', { status: 405 }));
}

async function getAllStudents(env) {
  // Get all students from KV
  const studentsData = await env.STUDENT_DATA.get('all_students');
  if (!studentsData) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(studentsData, {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function saveStudent(env, studentData) {
  // Get existing students
  let students = [];
  const existingData = await env.STUDENT_DATA.get('all_students');
  if (existingData) {
    students = JSON.parse(existingData);
  }
  
  // Add or update student
  const existingIndex = students.findIndex(s => s.id === studentData.id);
  if (existingIndex >= 0) {
    students[existingIndex] = studentData;
  } else {
    students.push(studentData);
  }
  
  // Save back to KV
  await env.STUDENT_DATA.put('all_students', JSON.stringify(students));
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function saveAllStudents(env, allData) {
  await env.STUDENT_DATA.put('all_students', JSON.stringify(allData));
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function deleteAllStudents(env) {
  await env.STUDENT_DATA.delete('all_students');
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function getBackup(env) {
  const studentsData = await env.STUDENT_DATA.get('all_students');
  return new Response(studentsData || '[]', {
    headers: { 
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="student_backup.json"'
    }
  });
}

function handleCors(response = null) {
  if (!response) {
    response = new Response(null, { status: 204 });
  }
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  if (response instanceof Response) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  
  return response;
}