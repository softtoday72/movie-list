const dataPanel = document.querySelector('#data-panel')
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []



axios
  .get(INDEX_URL)
  .then((response) => {
    for (const movie of response.data.results) {
      movies.push(movie)
    }
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
    console.log(movies.length)
  })
  .catch((err) => console.log(err))



function renderMovieList(data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `<div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img
            src="${POSTER_URL + item.image}"
            class="card-img-top" alt="...">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
              data-bs-target="#Movie-Modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>

        </div>
      </div>
    </div>`
  })
  dataPanel.innerHTML = rawHTML
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {

    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  //開 modal 前先清空資料 , 感覺比較好
  modalTitle.innerText = ''
  modalDate.innerText = 'Release date: '
  modalDescription.innerText = ''
  modalImage.innerHTML = ''

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
let filteredMovies = []
//這邊的 <button type ="submit"> 所以監聽器事件掛 submit
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //點擊 form 裡的 input[type="submit"] 或 button[type="submit"] 時，也會自動跳頁，並且將表單內容提交給遠端伺服器
  event.preventDefault()
  //用 .value 取 input值 , trim()去除兩側多餘的空白, toLowerCase() 改成小寫
  const keyword = searchInput.value.trim().toLowerCase()
  if (!keyword) {
    renderMovieList(movies)
  }
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  renderMovieList(getMoviesByPage(1))
  renderPaginator(filteredMovies.length)
})

//存取收藏清單
//會用到 存入資料 - localStorage.setItem('key','value') 
//取出資料localStorage.getItem('key')
//JSON.stringify() ：存入時，將資料轉為 JSON 格式的字串。
//JSON.parse()：取出時，將 JSON 格式的字串轉回 JavaScript 原生物件。
const addFavorite = document.querySelector('.btn-add-favorite')
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  const movie = movies.find(movie => movie.id === id)
  if (list.some(movie => movie.id === id)) {
    return alert('這個電影已經在清單中了!')
  }
  list.push(movie)
  localStorage.setItem("favoriteMovies", JSON.stringify(list))
  
}

const MOVIES_PER_PAGE = 12
function getMoviesByPage(page) {
  //輸入頁碼 , 切割出要秀出來的電影資料 
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //const endIndex = startIndex + MOVIES_PER_PAGE , 或者直接寫startIndex + MOVIES_PER_PAGE

  //回傳一筆限定範圍的資料
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//切換頁數器 , 計算出需要的頁數

const paginator = document.querySelector('#paginator')

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages ; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
    paginator.innerHTML = rawHTML
}

//在頁數器掛上監聽器 
paginator.addEventListener('click', function onPaginatorOnClicked(event){
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
  
})