#!/usr/bin/env python3
"""Script rápido para testar backend"""

import requests
import json

def teste_health():
    """Testa endpoint de health"""
    try:
        response = requests.get('http://localhost:8000/health', timeout=5)
        print(f"✅ Health Status: {response.status_code}")
        print(f"📊 Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health Error: {e}")
        return False

def teste_login():
    """Testa endpoint de login"""
    try:
        data = {
            'email': 'ricardo.nilton@hotmail.com',
            'password': '123456'
        }
        response = requests.post(
            'http://localhost:8000/api/v1/auth/login', 
            json=data, 
            timeout=10
        )
        print(f"🔐 Login Status: {response.status_code}")
        print(f"📨 Response: {response.text[:200]}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Login Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testando Backend...")
    
    if teste_health():
        print("\n" + "="*50)
        teste_login()
    else:
        print("❌ Backend não está respondendo") 