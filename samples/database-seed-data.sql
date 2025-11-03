-- RoleReady Database Seed Data
-- Sample data for development and testing
-- Run this after initial migrations

-- ============================================
-- Sample Users
-- ============================================
INSERT INTO users (id, email, name, password, provider, "twoFactorEnabled", "createdAt", "updatedAt")
VALUES
  ('user001', 'john.doe@example.com', 'John Doe', '$2b$10$hashedpassword1', 'local', false, NOW(), NOW()),
  ('user002', 'jane.smith@example.com', 'Jane Smith', '$2b$10$hashedpassword2', 'local', false, NOW(), NOW()),
  ('user003', 'sarah.johnson@example.com', 'Sarah Johnson', '$2b$10$hashedpassword3', 'local', true, NOW(), NOW());

-- ============================================
-- Sample User Profiles
-- ============================================
INSERT INTO user_profiles ("userId", title, company, location, phone, website, bio, "createdAt", "updatedAt")
VALUES
  ('user001', 'Senior Software Engineer', 'Tech Corp', 'San Francisco, CA', '(555) 111-2222', 'johndoe.dev', 'Experienced full-stack developer', NOW(), NOW()),
  ('user002', 'Data Scientist', 'Analytics Inc', 'New York, NY', '(555) 222-3333', 'janesmith.io', 'ML engineer with 5+ years experience', NOW(), NOW()),
  ('user003', 'Product Manager', 'StartupXYZ', 'Austin, TX', '(555) 333-4444', 'sarahjohnson.com', 'Product leader passionate about UX', NOW(), NOW());

-- ============================================
-- Sample Resumes
-- ============================================
INSERT INTO resumes (id, "userId", title, template, data, "createdAt", "updatedAt")
VALUES
  (
    'resume001',
    'user001',
    'Software Engineer Resume',
    'modern',
    '{"personalInfo": {"firstName": "John", "lastName": "Doe", "email": "john.doe@example.com"}}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'resume002',
    'user002',
    'Data Scientist Resume',
    'classic',
    '{"personalInfo": {"firstName": "Jane", "lastName": "Smith", "email": "jane.smith@example.com"}}'::jsonb,
    NOW(),
    NOW()
  );

-- ============================================
-- Sample Job Applications
-- ============================================
INSERT INTO job_applications (id, "userId", title, company, status, "appliedDate", location, salary, notes, "createdAt", "updatedAt")
VALUES
  (
    'job001',
    'user001',
    'Senior Full-Stack Engineer',
    'Tech Innovations',
    'applied',
    '2024-01-15',
    'Remote',
    '$140,000 - $180,000',
    'Applied through company website',
    NOW(),
    NOW()
  ),
  (
    'job002',
    'user001',
    'Frontend Developer',
    'Creative Agency',
    'interview',
    '2024-01-10',
    'New York, NY',
    '$120,000 - $150,000',
    'Interview scheduled for Jan 25',
    NOW(),
    NOW()
  ),
  (
    'job003',
    'user002',
    'Machine Learning Engineer',
    'AI Solutions',
    'offer',
    '2023-12-20',
    'San Francisco, CA',
    '$160,000 - $200,000',
    'Received offer, negotiating terms',
    NOW(),
    NOW()
  );

-- ============================================
-- Sample Skills
-- ============================================
INSERT INTO skills (id, "userId", name, category, proficiency, "createdAt", "updatedAt")
VALUES
  ('skill001', 'user001', 'React', 'Frontend', 'expert', NOW(), NOW()),
  ('skill002', 'user001', 'Node.js', 'Backend', 'advanced', NOW(), NOW()),
  ('skill003', 'user001', 'TypeScript', 'Language', 'advanced', NOW(), NOW()),
  ('skill004', 'user002', 'Python', 'Language', 'expert', NOW(), NOW()),
  ('skill005', 'user002', 'TensorFlow', 'ML Framework', 'advanced', NOW(), NOW()),
  ('skill006', 'user002', 'SQL', 'Database', 'advanced', NOW(), NOW());

-- ============================================
-- Sample Education
-- ============================================
INSERT INTO education (id, "userId", institution, degree, field, location, "startDate", "endDate", gpa, "createdAt", "updatedAt")
VALUES
  (
    'edu001',
    'user001',
    'Stanford University',
    'Bachelor of Science',
    'Computer Science',
    'Stanford, CA',
    '2015-09-01',
    '2019-05-31',
    '3.8',
    NOW(),
    NOW()
  ),
  (
    'edu002',
    'user002',
    'MIT',
    'Master of Science',
    'Computer Science',
    'Cambridge, MA',
    '2018-09-01',
    '2020-05-31',
    '3.9',
    NOW(),
    NOW()
  );

-- ============================================
-- Sample Work Experience
-- ============================================
INSERT INTO work_experience (id, "userId", company, position, location, "startDate", "endDate", description, "createdAt", "updatedAt")
VALUES
  (
    'exp001',
    'user001',
    'Tech Corp',
    'Senior Software Engineer',
    'San Francisco, CA',
    '2021-03-01',
    NULL,
    'Led development of microservices architecture',
    NOW(),
    NOW()
  ),
  (
    'exp002',
    'user002',
    'Data Analytics Inc',
    'Machine Learning Engineer',
    'Boston, MA',
    '2020-01-15',
    NULL,
    'Developed ML models for customer prediction',
    NOW(),
    NOW()
  );

