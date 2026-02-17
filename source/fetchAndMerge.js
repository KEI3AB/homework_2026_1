'use strict';

/**
 * Загружает JSON-данные с указанных URL-адресов и объединяет их в один объект.
 * Если ключи совпадают, значения собираются в массив (только уникальные значения).
 * @param {Array<string>} urls - Массив URL-адресов для загрузки данных.
 * 
 * @example
 * // Пример вызова:
 * const result = await fetchAndMergeData(['https://vk.example.com/vkid', 'https://mailru.example.com/mailid']);
 * 
 * // Результат:
 * // {
 * //     "age": [25, 22],
 * //     "id" : [1, 2],
 * //     "name": ["Олег", "Мария"],
 * //     ...
 * // }
 * 
 * @returns {Promise<Object>} - Промис, который разрешается в объединенный объект с данными.
 */
const fetchAndMergeData = async urls => {
    const promises = urls.map(url => fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json()
        })
        .catch(error => {
            return null
        }));
    const data = await Promise.all(promises);

    const result = data.reduce((acc, obj) => {
        if (obj === null) return acc;

        Object.entries(obj).forEach(([key, value]) => {
            if (!acc[key]) {
                acc[key] = [ value ];
            } else if (!acc[key].includes(value)) {
                acc[key].push(value);
            }
        });

        return acc;
    }, {});

    return result;
}