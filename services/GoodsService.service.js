API_URL = 'https://api.valantis.store:41000/';
PASSWORD = 'Valantis';

const GoodsService = {
    async getIds({ limit, offset }) {
        // Получаем ids
        try {
            const date = new Date;
            const data = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth": md5(`${PASSWORD}_${date.toISOString().slice(0, 10).split("-").join("")}`)
                },
                body: JSON.stringify({
                    "action": "get_ids",
                    "params": { "offset": offset, "limit": limit }
                })
            })
            if (data.status !== 200) {
                throw new Error(data.statusText)
            } else {
                const response = await data.json()
                return response
            }

        } catch (err) {
            console.log(err);
            return {
                error: err
            }
        }
    },
    async getItems(ids) {
        // Получаем товары
        try {
            const date = new Date;
            const data = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth": md5(`${PASSWORD}_${date.toISOString().slice(0, 10).split("-").join("")}`)
                },
                body: JSON.stringify({
                    "action": "get_items",
                    "params": { "ids": ids }
                })
            })
            if (data.status !== 200) {
                throw new Error(data.statusText)
            } else {
                const response = await data.json()
                // Убираем дубли
                const result = response.result.reduce((acc, item) => {
                    if (acc.findIndex(obj => obj.id === item.id) === -1) {
                        acc.push(item)
                    }
                    return acc
                }, [])
                return result
            }

        } catch (err) {
            console.log(err);
            return {
                error: err
            }
        }
    },
    async getFields() {
        // Получаем список брендов
        try {
            const date = new Date;
            const data = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth": md5(`${PASSWORD}_${date.toISOString().slice(0, 10).split("-").join("")}`)
                },
                body: JSON.stringify({
                    "action": "get_fields",
                    "params": { "field": "brand" }
                })
            })

            if (data.status !== 200) {
                throw new Error(data.statusText)
            } else {
                const response = await data.json()
                const set = new Set(response.result)
                const result = Array.from(set).sort().filter(obj => obj !== null)
                return result
            }

        } catch (err) {
            console.log(err);
            return {
                error: err
            }
        }
    },
    async getFilterIds(params) {
        // Получаем id по фильтру
        // На текущий момент API принимает только первый параметр, по нескольким параметрам фильтрацию не выдает
        let paramsForRequest = {};

        if (params.hasOwnProperty('title') && params.title) {
            paramsForRequest['product'] = params.title.trim()
        }
        if (params.hasOwnProperty('brand') && !!params.brand) {
            paramsForRequest['brand'] = params.brand
        }
        if (params.hasOwnProperty('price') && params.price) {
            paramsForRequest['price'] = parseFloat(params.price)
        }

        if (!!paramsForRequest) {
            try {
                const date = new Date;

                const data = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth": md5(`${PASSWORD}_${date.toISOString().slice(0, 10).split("-").join("")}`)
                    },
                    body: JSON.stringify({
                        "action": "filter",
                        "params": paramsForRequest
                    })
                })

                if (data.status !== 200) {
                    throw new Error(data.statusText)
                } else {
                    const response = await data.json()
                    return response
                }

            } catch (err) {
                console.log(err);
                return {
                    error: err
                }
            }
        }

    },
}
