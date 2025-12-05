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
    
    // Serve static files for all other routes
    return env.ASSETS.fetch(request);
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