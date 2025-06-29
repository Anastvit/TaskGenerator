Генератор задач на графах
==========================

Интерактивное веб-приложение для создания и генерации вариантов задач.
Пользователь может собирать шаблоны из узлов (текст, переменные, массивы), соединять их связями, сохранять, загружать и генерировать текстовые варианты.  
Есть возможность создавать темы, экспортировать варианты в PDF и работать с локальной базой данных.

---

Запуск проекта
==============

1. Клонировать репозиторий:

    git clone https://github.com/your-username/your-repo-name.git  
    cd your-repo-name

---

2. Установить и запустить frontend (React + Vite):

    npm install  
    npm run dev

Откроется по адресу: http://localhost:5173

---

3. Установить и запустить backend (FastAPI + SQLite):

    cd backend  
    python -m venv venv  
    source venv/bin/activate         (на Windows: venv\Scripts\activate)  
    pip install -r requirements.txt  
    uvicorn main:app --reload

API будет доступно по адресу: http://localhost:8000

Если файла requirements.txt нет, создайте его после установки зависимостей:

    pip freeze > requirements.txt
