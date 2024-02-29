// В файле несколько компонентов, не стал разбивать на файлы, чтобы не делать много импортов в html
// Т.к. проект небольшой, не стал использовать провайдер для хранения состояний, в своем проекте использовал Redux.

const e = React.createElement;

const App = () => {
    const [loading, setLoading] = React.useState(true)
    const [limit, setLimit] = React.useState(50)
    const [page, setPage] = React.useState(0)

    const [itemsIds, setItemsIds] = React.useState([])
    const [items, setItems] = React.useState([])
    const [error, setError] = React.useState({})

    const [brands, setBrands] = React.useState(0)

    const [filteredItemsIds, setFilteredItemsIds] = React.useState([])
    const [filterApply, setFilterApply] = React.useState(false)
    const [filterBrand, setFilterBrand] = React.useState(0)
    const [filterTitle, setFilterTitle] = React.useState("")
    const [filterPrice, setFilterPrice] = React.useState(0)

    // Получаем список брендов для фильтра
    React.useEffect(() => {
        GoodsService.getFields()
            .then(res => setBrands(res))
            .catch(err => {
                console.log(err);
                setError(res);
            })
    }, [])

    // Запрос списка id с фильтром
    React.useEffect(() => {
        setItems([]);
        if ((filterBrand || filterTitle || filterPrice) && filterApply) {
            setItemsIds([]);
            setFilteredItemsIds([]);
            setLoading(true);
            GoodsService.getFilterIds({ brand: filterBrand, title: filterTitle, price: filterPrice })
                .then(res => {
                    if (!!res && res.hasOwnProperty('error')) {
                        setError(res)
                        setLoading(false);
                    } else if (res.result.length === 0) {
                        setLoading(false);
                    } else {
                        setFilteredItemsIds(res.result);
                        setLoading(false);
                    }
                })
                .catch(err => {
                    console.log(err);
                    setError(res);
                    setLoading(false);
                })
        }
    }, [filterApply])

    // Запрос списка id без фильтра
    React.useEffect(() => {
        setItems([])
        setLoading(true)
        GoodsService.getIds({ limit: limit, offset: page * limit })
            .then(res => {
                if (!!res && res.hasOwnProperty('error')) {
                    setError(res)
                    setLoading(false)
                } else {
                    setItemsIds(res.result);
                    setLoading(false)
                }

            })
            .catch(err => {
                console.log(err);
                setError(res);
                setLoading(false);
            })
    }, [limit, page])

    // Получаем товары по id
    React.useEffect(() => {
        setItems([])
        setLoading(true)
        if (!!itemsIds && itemsIds.length) {
            // Просто список товаров, без фильтров
            setLoading(true)
            GoodsService.getItems(itemsIds)
                .then(res => {
                    if (!!res && res.hasOwnProperty('error')) {
                        setError(res)
                        setLoading(false)
                    } else {
                        setItems(res);
                        setLoading(false)
                        setError({})
                    }
                })
                .catch(err => {
                    console.log(err);
                    setError(res);
                    setLoading(false);
                })
        } else if (!!filteredItemsIds && filteredItemsIds.length) {
            // Товары с фильтром
            setLoading(true)
            if (filteredItemsIds.length <= 100) {
                GoodsService.getItems(filteredItemsIds)
                    .then(res => {
                        if (!!res && res.hasOwnProperty('error')) {
                            setError(res)
                            setLoading(false)
                        } else {
                            setItems(res);
                            setLoading(false)
                            setError({})
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        setError(res);
                        setLoading(false);
                    });
                setFilterApply(false);
                setFilterBrand(0);
                setFilterTitle("");
                setFilterPrice(0)
            } else {
                // делаем список id уникальным
                const uniqueFilteredItemsIds = Array.from(new Set(filteredItemsIds));
                let page = 0;
                const limit = 100;
                const totalPages = uniqueFilteredItemsIds.length / limit;
                setLoading(true)

                while (page <= totalPages) {
                    // Делаем запрос по количеству страниц
                    GoodsService.getItems(uniqueFilteredItemsIds.slice(page * limit, page * limit + 99))
                        .then(res => {
                            if (!!res && res.hasOwnProperty('error')) {
                                setError(res)
                            } else {
                                setItems([...items, ...res]);
                                setError({})
                            }

                        })
                        .catch(err => {
                            console.log(err);
                            setError(res);
                            setLoading(false);
                        });
                    page++;
                };
                setLoading(false);
                setFilterApply(false);
                setFilterBrand(0);
                setFilterTitle("");
                setFilterPrice(0)
            }

        } else if (!itemsIds.length) {
            setLoading(false);
            setFilterApply(false);
        }

    }, [itemsIds, filteredItemsIds])


    return <>
        <header>
            <h1>Valantis Jewelry</h1>
        </header>
        <main>
            <Filter brands={brands}
                filterBrand={filterBrand}
                setFilterBrand={setFilterBrand}
                filterTitle={filterTitle}
                setFilterTitle={setFilterTitle}
                filterPrice={filterPrice}
                setFilterPrice={setFilterPrice}
                setFilterApply={setFilterApply}
            />
            <div className="items_list">
                {!!loading && <>
                    <div>Загрузка</div>
                    <div className="spin-wrapper">
                        <div className="spinner">
                        </div>
                    </div>
                </>}
                {!!error && error.hasOwnProperty('error') && <div>
                    <p>Ой, произошла ошибка (подробности в консоли)</p>
                </div>}
                {items.length ?
                    items.map(item => <div key={item.id} className="item">
                        <div className="item_wrapper">
                            <img src="./images/photo_icon.jpg" alt="Картинка"></img>
                            <div className="item_description">
                                {!!item.id ? <p>{item.id}</p> : <p>&nbsp;</p>}
                                {!!item.brand ? <p>{item.brand}</p> : <p>&nbsp;</p>}
                                {!!item.product ? <p>{item.product}</p> : <p>&nbsp;</p>}
                                {!!item.price ? <p>{item.price}&#8381;</p> : <p>&nbsp;</p>}
                            </div>
                        </div>

                    </div>
                    )
                    : <></>}
            </div>
            {/* Т.к. API не выдает фильтрованный список по страницам отключаем пагинацию */}
            {!filteredItemsIds.length && <Paginator limit={limit} setLimit={setLimit} page={page} setPage={setPage} itemsLength={items.length} />}
        </main>
        <footer>Copyright &copy;</footer>
    </>
}

const domContainer = document.querySelector('#root');
const root = ReactDOM.createRoot(domContainer);
root.render(e(App));


// Компонент пагинации
const Paginator = ({ limit, setLimit, page, setPage, itemsLength }) => {

    return <div className="paginator">
        <div className="limit_selector">
            {/* Изменение количества товаров на странице */}
            <select defaultValue={5} onChange={(e) => setLimit(+e.target.value)}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
            </select>
            <p>на странице</p>
        </div>
        <div className="page_selector">
            {/* Изменение номера страницы */}
            <div onClick={() => {
                if (page > 0) {
                    setPage(page - 1)
                }
            }}>{"<"}</div>
            <div>{page + 1}</div>
            <div onClick={() => {
                if (itemsLength >= limit) {
                    setPage(page + 1)
                }

            }}>{">"}</div>
        </div>
    </div>
}

// Компонент фильтра
const Filter = ({
    brands,
    filterBrand,
    setFilterBrand,
    filterTitle,
    setFilterTitle,
    filterPrice,
    setFilterPrice,
    setFilterApply
}) => {

    return <div className="filter">
        {/* Т.к. API не выдает фильтрованный список по нескольким полям, при изменении поля, остальные обнуляем */}
        <div>Фильтры:</div>
        <form onSubmit={e => {
            e.preventDefault();
            setFilterApply(true)
        }}>
            <label>
                <p>Название</p>
                <input type={"text"} value={filterTitle} onChange={e => {
                    setFilterTitle(e.target.value);
                    setFilterPrice(0);
                    setFilterBrand(0)
                }} />
            </label>
            <label>
                <p>Цена</p>
                <input type={"number"} value={filterPrice} onChange={e => {
                    setFilterPrice(e.target.value);
                    setFilterBrand(0);
                    setFilterTitle("")
                }} />
            </label>
            {!!brands && brands.length &&
                <label>
                    <p>Бренд</p>
                    <select value={filterBrand} onChange={e => {
                        if (e.target.value == "---") {
                            setFilterBrand(0)
                        } else {
                            setFilterBrand(e.target.value)
                        }
                        setFilterTitle("");
                        setFilterPrice(0)
                    }}>
                        <option key={0}>---</option>
                        {brands.map(obj => <option key={obj} value={obj}>{obj}</option>)}
                    </select>
                </label>
            }
            <input type={"submit"} value={"Применить фильтр"} />
        </form>

    </div>
}