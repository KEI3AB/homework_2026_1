'use strict';

/**
 * Загружает JSON-данные с указанных URL-адресов и объединяет их в один объект.
 * Если ключи совпадают, значения собираются в массив (только уникальные значения).
 * @async
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
 * Если входной параметр - не массив, то возвращает пустой объект.
 * 
 * Если при fetch у нас response с ошибкой, то логируем ошибку, и данные
 *  с соответствующего URL не включаются в итоговый результат
 * 
 * Функция никогда не отклоняет Promise.
 * Ошибки отдельных запросов логируются.
 * 
 * @returns {Promise<Object>} - Промис, который разрешается:
 * - в объединенный объект с данными из успешно загруженных URL;
 * - в пустой объект, если входной параметр некорректен.
 */
const fetchAndMergeData = async urls => {
    if (!Array.isArray(urls)) {
        return {};
    }

    const promises = urls.map(url => fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.log(error);
            return null;
        }));
    const data = await Promise.all(promises);

    const setsStorage = data.reduce((acc, obj) => {
        if (!obj) return acc;

        Object.entries(obj).forEach(([key, value]) => {
            if (!acc[key]) {
                acc[key] = new Set();
            }
            acc[key].add(value);
        });

        return acc;
    }, {});

    const result = Object.fromEntries(
        Object.entries(setsStorage).map(([key, set]) => [key, Array.from(set)])
    );

    return result;
}

