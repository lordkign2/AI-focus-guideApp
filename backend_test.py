#!/usr/bin/env python3
"""
Backend API Testing for AI Personal Assistant
Tests all FastAPI endpoints with proper error handling
"""

import requests
import sys
import json
from datetime import datetime

class AIAssistantAPITester:
    def __init__(self, base_url="https://469ee993-11e2-4213-aa1e-2e3d6edbfa89.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")

    def test_root_endpoint(self):
        """Test root endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                try:
                    data = response.json()
                    details += f" | Message: {data.get('message', 'N/A')}"
                except:
                    # Handle non-JSON response
                    details += f" | Content: {response.text[:50]}..."
            self.log_test("Root Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Error: {str(e)}")
            return False

    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/health")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" | Status: {data.get('status', 'N/A')}"
            self.log_test("Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("Health Check", False, f"Error: {str(e)}")
            return False

    def test_backup_notes(self):
        """Test backup notes endpoint"""
        test_notes = [
            {
                "id": "test-note-1",
                "content": "Test note content",
                "created_at": datetime.now().isoformat(),
                "ai_enhanced": False
            },
            {
                "id": "test-note-2", 
                "content": "Another test note",
                "created_at": datetime.now().isoformat(),
                "ai_enhanced": True
            }
        ]
        
        try:
            response = self.session.post(f"{self.base_url}/api/backup/notes", json=test_notes)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" | Count: {data.get('count', 'N/A')}"
            self.log_test("Backup Notes", success, details)
            return success
        except Exception as e:
            self.log_test("Backup Notes", False, f"Error: {str(e)}")
            return False

    def test_backup_tasks(self):
        """Test backup tasks endpoint"""
        test_tasks = [
            {
                "id": "test-task-1",
                "content": "Complete project documentation",
                "completed": False,
                "created_at": datetime.now().isoformat(),
                "priority": "high"
            },
            {
                "id": "test-task-2",
                "content": "Review code changes", 
                "completed": True,
                "created_at": datetime.now().isoformat(),
                "priority": "medium"
            }
        ]
        
        try:
            response = self.session.post(f"{self.base_url}/api/backup/tasks", json=test_tasks)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" | Count: {data.get('count', 'N/A')}"
            self.log_test("Backup Tasks", success, details)
            return success
        except Exception as e:
            self.log_test("Backup Tasks", False, f"Error: {str(e)}")
            return False

    def test_analytics(self):
        """Test analytics endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/analytics")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" | Notes: {data.get('total_notes', 'N/A')}, Tasks: {data.get('total_tasks', 'N/A')}, Score: {data.get('productivity_score', 'N/A')}"
            self.log_test("Analytics", success, details)
            return success
        except Exception as e:
            self.log_test("Analytics", False, f"Error: {str(e)}")
            return False

    def test_enhance_note(self):
        """Test AI note enhancement endpoint"""
        test_content = "Meeting notes from today's standup"
        
        try:
            # The endpoint expects a query parameter
            response = self.session.post(f"{self.base_url}/api/ai/enhance-note?note_content={test_content}")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" | Enhanced: {len(data.get('enhanced', ''))} chars"
            else:
                details += f" | Response: {response.text[:100]}"
            self.log_test("Enhance Note", success, details)
            return success
        except Exception as e:
            self.log_test("Enhance Note", False, f"Error: {str(e)}")
            return False

    def test_task_suggestions(self):
        """Test AI task suggestions endpoint"""
        test_context = "Working on a web application project with React and FastAPI"
        
        try:
            # The endpoint expects a query parameter
            response = self.session.post(f"{self.base_url}/api/ai/task-suggestions?context={test_context}")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" | Suggestions: {len(data.get('suggestions', []))}"
            else:
                details += f" | Response: {response.text[:100]}"
            self.log_test("Task Suggestions", success, details)
            return success
        except Exception as e:
            self.log_test("Task Suggestions", False, f"Error: {str(e)}")
            return False

    def test_user_profile(self):
        """Test user profile endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/user/profile")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" | User: {data.get('name', 'N/A')}"
            self.log_test("User Profile", success, details)
            return success
        except Exception as e:
            self.log_test("User Profile", False, f"Error: {str(e)}")
            return False

    def test_daily_summary(self):
        """Test daily summary endpoint"""
        try:
            response = self.session.post(f"{self.base_url}/api/ai/daily-summary")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" | Summary length: {len(data.get('summary', ''))}"
            self.log_test("Daily Summary", success, details)
            return success
        except Exception as e:
            self.log_test("Daily Summary", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting AI Personal Assistant Backend API Tests")
        print("=" * 60)
        
        # Test basic endpoints
        self.test_root_endpoint()
        self.test_health_check()
        
        # Test data backup endpoints
        self.test_backup_notes()
        self.test_backup_tasks()
        
        # Test analytics
        self.test_analytics()
        
        # Test AI endpoints
        self.test_enhance_note()
        self.test_task_suggestions()
        self.test_daily_summary()
        
        # Test user profile
        self.test_user_profile()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend API is working correctly.")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed. Check the issues above.")
            return False

def main():
    """Main test execution"""
    tester = AIAssistantAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())