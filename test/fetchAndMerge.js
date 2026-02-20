/* eslint-disable require-jsdoc */

'use strict';

QUnit.module("Тестируем функцию fetchAndMerge", function() {
    QUnit.test("Возвращает объект при полученных данных", async function(assert) {
        const urls = [
            'https://vk.example.com/vkid',
            'https://mailru.example.com/mailid',
        ];
        const expected = {
            "age": [25, 22],
            "id": [1, 2],
            "name": ["Олег", "Мария"],
            "surname": ["Петров", "Иванова"],
            "status": ["Дуров, верни стену!"],
        };
        
        window.fetch = (url) => {
            const data = {
                'https://vk.example.com/vkid': { "id": 1, "name": "Олег", "surname": "Петров", "age": 25, "status": "Дуров, верни стену!" },
                'https://mailru.example.com/mailid': { "id": 2, "name": "Мария", "surname": "Иванова", "age": 22 },
            };

            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data[url]),
            });
        };

        const result = await fetchAndMergeData(urls);
        assert.deepEqual(result, expected, "Должно правильно объединять данные с разных URL");
    });

    QUnit.test("Работает правильно при ошибках fetch", async function(assert) {
        const urls = [
            'https://vk.example.com/mailru',
            'https://vk.example.com/byte'
        ];

        window.fetch = () => Promise.reject(new Error("Network error"));

        const result = await fetchAndMergeData(urls);
        assert.deepEqual(result, {}, "Должно возвращать пустой объект при ошибке fetch");
    });

    QUnit.test("Сохраняет только уникальные данные", async function(assert) {
        const urls = [
            'https://vk.example.com/vkid',
            'https://mailru.example.com/mailid',
        ];
        const expected = {
            "age": [25],
            "id": [1, 2],
            "name": ["Саша"],
            "surname": ["Петров", "Иванова"],
            "status": ["Дуров, верни стену!"],
        };
        
        window.fetch = (url) => {
            const data = {
                'https://vk.example.com/vkid': { "id": 1, "name": "Саша", "surname": "Петров", "age": 25, "status": "Дуров, верни стену!" },
                'https://mailru.example.com/mailid': { "id": 2, "name": "Саша", "surname": "Иванова", "age": 25 },
            };

            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data[url]),
            });
        };

        const result = await fetchAndMergeData(urls);
        assert.deepEqual(result, expected, "Должно правильно объединять данные с разных URL");
    });

    QUnit.test("Верно читает при пустом вводе", async function(assert) {
        const urls = [];

        const result = await fetchAndMergeData(urls);
        assert.deepEqual(result, {}, "Должен верно обработать пустой массив");
    });

    QUnit.test("Читает верно даже при ошибке в одном из URL-ов", async function(assert) {
        const urls = [
            'https://vk.example.com/vkid',
            'https://max.example.com/maxid',
            'https://mailru.example.com/mailid',
        ];
        const expected = {
            "age": [25],
            "id": [1, 2],
            "name": ["Саша"],
            "surname": ["Петров", "Иванова"],
            "status": ["Дуров, верни стену!"],
        };
        
        window.fetch = (url) => {
            if (url == 'https://max.example.com/maxid') {
                return Promise.reject(new Error("Network error"));
            }

            const data = {
                'https://vk.example.com/vkid': { "id": 1, "name": "Саша", "surname": "Петров", "age": 25, "status": "Дуров, верни стену!" },
                'https://mailru.example.com/mailid': { "id": 2, "name": "Саша", "surname": "Иванова", "age": 25 },
            };
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data[url]),
            });
        };

        const result = await fetchAndMergeData(urls);
        assert.deepEqual(result, expected, "Должно правильно объединять данные с разных URL");
    });

    QUnit.test("Вводим не массив url-ов, а значение другого типа", async function(assert) {
        const urls = 123;

        const result = await fetchAndMergeData(urls);
        assert.deepEqual(result, {}, "Должно возвращать пустой при неверном вводе");
    });

    QUnit.test("Вводим не массив url-ов, а null", async function(assert) {
        const urls = null;

        const result = await fetchAndMergeData(urls);
        assert.deepEqual(result, {}, "Должно возвращать пустой при неверном вводе");
    });
    
    QUnit.test("Верно продолжает читать данные, даже если среди url-ов есть переменная другого типа", async function(assert) {
        const urls = [
            'https://vk.example.com/vkid',
            null,
            'https://mailru.example.com/mailid',
            123,
        ];
        const expected = {
            "age": [25, 22],
            "id": [1, 2],
            "name": ["Даниил", "Мария"],
            "surname": ["Колбасенко", "Иванова"],
            "status": ["Дуров, верни стену!"],
        };
        
        window.fetch = (url) => {
            const data = {
                'https://vk.example.com/vkid': { "id": 1, "name": "Даниил", "surname": "Колбасенко", "age": 25, "status": "Дуров, верни стену!" },
                'https://mailru.example.com/mailid': { "id": 2, "name": "Мария", "surname": "Иванова", "age": 22 },
            };

            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data[url]),
            });
        };

        const result = await fetchAndMergeData(urls);
        assert.deepEqual(result, expected, "Должнен правильно продолжить чтение");
    });
});

