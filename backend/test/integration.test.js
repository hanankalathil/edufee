const request = require('supertest');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Mock db path to restore after tests
const dbPath = path.join(__dirname, '../data.json');
const dbBackupPath = path.join(__dirname, '../data.json.bak');

// Backup DB
fs.copyFileSync(dbPath, dbBackupPath);

const { app } = require('../server');

const JWT_SECRET = 'super-secret-key-for-edufees-12345';
const token = jwt.sign({ id: 'admin1', email: 'admin@techora.in', role: 'Super Admin' }, JWT_SECRET, { expiresIn: '1h' });

describe('EduFees API Integration Tests', () => {
  after(() => {
    // Restore DB
    fs.copyFileSync(dbBackupPath, dbPath);
    fs.unlinkSync(dbBackupPath);
  });

  describe('Auth API', () => {
    it('should return user info for /api/me', async () => {
      const res = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.user.email).to.equal('admin@techora.in');
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/me');
      expect(res.status).to.equal(401);
    });
  });

  describe('Students API', () => {
    let studentId;

    it('should create a new student', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${token}`)
        .send({
          studentId: 'TEST_001',
          name: 'Test Student',
          parentName: 'Test Parent',
          whatsappNumber: '1234567890',
          class: 'Class 10',
          batch: 'Morning A',
          subjects: 'Math, Science'
        });

      expect(res.status).to.equal(200);
      expect(res.body.name).to.equal('Test Student');
      studentId = res.body._id;
    });

    it('should get all students', async () => {
      const res = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      const testStudent = res.body.find(s => s.studentId === 'TEST_001');
      expect(testStudent).to.exist;
    });

    it('should delete the student', async () => {
      const res = await request(app)
        .delete(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
    });
  });

  describe('Classes & Batches API', () => {
    it('should fetch classes', async () => {
      const res = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('should fetch batches', async () => {
      const res = await request(app)
        .get('/api/batches')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('Fees API', () => {
    it('should fetch fees', async () => {
      const res = await request(app)
        .get('/api/fees')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('Attendance API', () => {
    it('should mark attendance', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2026-08-01',
          class: 'Class 10',
          batch: 'Morning A',
          records: [
            { student: 'student1', status: 'Present' }
          ]
        });
      
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
    });

    it('should fetch attendance', async () => {
      const res = await request(app)
        .get('/api/attendance?date=2026-08-01&className=Class 10&batch=Morning A')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).to.equal(200);
      expect(res.body.records).to.be.an('array');
      expect(res.body.records.length).to.be.greaterThan(0);
    });
  });

  describe('WhatsApp Integration API', () => {
    it('should get whatsapp status', async () => {
      const res = await request(app)
        .get('/api/whatsapp/status');
      
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('status');
    });
  });
});
