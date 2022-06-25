const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';

const leftMenu = document.querySelector('.left-menu'),
  hamburger = document.querySelector('.hamburger'),
  tvShowList = document.querySelector('.tv-shows__list'),
  modal = document.querySelector('.modal'),
  tvShows = document.querySelector('.tv-shows'),
  tvCardImg = document.querySelector('.tv-card__img'),
  modalTitle = document.querySelector('.modal__title'),
  genresList = document.querySelector('.genres-list'),
  rating = document.querySelector('.rating'),
  description = document.querySelector('.description'),
  modalLink = document.querySelector('.modal__link'),
  searchForm = document.querySelector('.search__form'),
  searchFormInput = document.querySelector('.search__form-input'),
  dropdown = document.querySelectorAll('.dropdown'),
  tvShowsHead = document.querySelector('.tv-shows__head'),
  posterWrapper = document.querySelector('.poster__wrapper'),
  pagination = document.querySelector('.pagination');

const loading = document.createElement('div');
loading.className = 'loading';

// Сlasses -------------------------------------------------------------------

class DBService {

  constructor() {
    this.SERVER = 'https://api.themoviedb.org/3';
    this.API_KEY = '78b6dadbec53d100363eb516f771f227';
  }

  getData = async (url) => {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`Cannot receive data from ${url}. Status ${res.status}`);
    }
  }

  getSearchResult = query => {
    this.temp = `${this.SERVER}/search/tv?api_key=${this.API_KEY}&query=${query}&language=ru-RU`;
    return this.getData(this.temp);
  }

  getNextPage = page => {
    return this.getData(this.temp + '&page=' + page);
  }

  getTVShow = id => this.getData(`${this.SERVER}/tv/${id}?api_key=${this.API_KEY}&language=ru-RU`);
  getTopRated = () => this.getData(`${this.SERVER}/tv/top_rated?api_key=${this.API_KEY}&language=ru-RU`);
  getPopular = () => this.getData(`${this.SERVER}/tv/popular?api_key=${this.API_KEY}&language=ru-RU`);
  getToday = () => this.getData(`${this.SERVER}/tv/airing_today?api_key=${this.API_KEY}&language=ru-RU`);
  getWeek = () => this.getData(`${this.SERVER}/tv/on_the_air?api_key=${this.API_KEY}&language=ru-RU`);

};

const dbService = new DBService();

// Functions -------------------------------------------------------------------

const renderCard = (response, target) => {

  tvShowList.textContent = '';

  if (!response.total_results) {
    loading.remove();
    tvShowsHead.textContent = 'По вашему запросу ничего не найдено!'
    tvShowsHead.style.color = 'red';
    return;
  }

  tvShowsHead.textContent = target ? target.textContent : 'Результат поиска';
  tvShowsHead.style.color = 'black';

  response.results.forEach(item => {

    const { backdrop_path: backdrop, name: title, poster_path: poster, vote_average: vote, id } = item;

    const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
    const backdropIMG = backdrop ? IMG_URL + backdrop : '';
    const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

    const card = document.createElement('li');
    card.idTV = id;
    card.className = 'tv-shows__item';
    card.innerHTML = `
    <a href="#" id="${id}" class="tv-card">
    ${voteElem}
    <img class="tv-card__img"
      src="${posterIMG}"
      data-backdrop="${backdropIMG}"
      alt=${title}>
    <h4 class="tv-card__head">${title}</h4>
    </a>
    `

    loading.remove();
    tvShowList.append(card);
  });

  pagination.textContent = '';

  if (!target && response.total_pages > 1) { // нужно ввести ограничения на вывод страниц 
    for (let i = 1; i <= response.total_pages; i++) {
      pagination.innerHTML += `<li class="pagination__item"><a href="#" class="pages">${i}</a></li>`;
    }
  }

};

const changeImage = event => {
  const card = event.target.closest('.tv-shows__item');

  if (card) {
    const img = card.querySelector('.tv-card__img');
    if (img.dataset.backdrop) {
      [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src]
    }
  }

  // if (card) {
  //   const img = card.querySelector('.tv-card__img');
  //   const changeImg = img.dataset.backdrop;
  //   if (changeImg) {
  //     img.dataset.backdrop = img.src;
  //     img.src = changeImg;
  //   }
  // }

};

const closeDropdown = () => {
  dropdown.forEach(item => {
    item.classList.remove('active');
  })
};



// Events -------------------------------------------------------------------

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const value = searchFormInput.value.trim();
  if (value) {
    tvShows.append(loading);
    dbService.getSearchResult(value).then(renderCard);
  }
  searchFormInput.value = '';
})

pagination.addEventListener('click', event => {
  event.preventDefault();
  const target = event.target;
  if (target.classList.contains('pages')) {
    tvShowList.append(loading);
    dbService.getNextPage(target.textContent).then(renderCard);
  }
})

// Left menu
hamburger.addEventListener('click', () => {
  leftMenu.classList.toggle('openMenu');
  hamburger.classList.toggle('open');
  closeDropdown();
});

document.addEventListener('click', event => {
  if (!event.target.closest('.left-menu')) {
    leftMenu.classList.remove('openMenu');
    hamburger.classList.remove('open');
    closeDropdown();
  }
});

leftMenu.addEventListener('click', event => {
  event.preventDefault();
  const target = event.target;
  const dropdwon = target.closest('.dropdown');
  if (dropdwon) {
    dropdwon.classList.toggle('active');
    leftMenu.classList.add('openMenu');
    hamburger.classList.add('open');
  }

  if (target.closest('#top-rated')) {
    dbService.getTopRated().then((response) => renderCard(response, target));
  }

  if (target.closest('#popular')) {
    dbService.getPopular().then((response) => renderCard(response, target));
  }

  if (target.closest('#today')) {
    dbService.getToday().then((response) => renderCard(response, target));
  }

  if (target.closest('#week')) {
    dbService.getWeek().then((response) => renderCard(response, target));
  }

  if (target.closest('#search')) {
    tvShowList.textContent = '';
    tvShowsHead.textContent = '';
  }

});


// Modal open
tvShowList.addEventListener('click', event => {
  event.preventDefault();

  const target = event.target;
  const card = target.closest('.tv-card')

  if (card) {

    dbService.getTVShow(card.id)
      .then(({ poster_path: posterPath, name: title, genres, vote_average: voteAverage, overview, homepage }) => {

        if (posterPath) {
          tvCardImg.src = IMG_URL + posterPath;
          tvCardImg.alt = title;
        } else {
          tvCardImg.src = 'img/no-poster.jpg';
          tvCardImg.alt = 'К сожалению постер отсутствует';
        }

        modalTitle.textContent = title;
        genresList.textContent = '';

        // Вариант 1:
        // genresList.innerHTML = response.genres.reduce((acc, item) => `${acc}<li>${item.name}</li>`, '');

        // Вариант 2:
        // response.genres.forEach(item => {
        //   genresList.innerHTML += `<li>${item.name}</li>`;
        // })

        // Вариант 3:
        for (const item of genres) {
          genresList.innerHTML += `<li>${item.name}</li>`;
        }

        rating.textContent = voteAverage;
        description.textContent = overview;
        modalLink.href = homepage;

      })

      .then(() => {
        document.body.style.overflow = 'hidden';
        modal.classList.remove('hide');
      })

  }

});

// Modal close
modal.addEventListener('click', event => {
  if (event.target.closest('.cross') || event.target.classList.contains('modal')) {
    document.body.style.overflow = '';
    modal.classList.add('hide');
  }
})

// Card change
tvShowList.addEventListener('mouseover', changeImage);
tvShowList.addEventListener('mouseout', changeImage);