// import { makeGalleryMarkup } from './js/makeGalleryMarkup';
// import { fetchImages } from './js/fetchImages';
// import { smoothScroll } from './js/smoothScroll';

// import { Notify } from 'notiflix/build/notiflix-notify-aio';
// import { Confirm } from 'notiflix/build/notiflix-confirm-aio';

// import SimpleLightbox from 'simplelightbox';

// import 'modern-normalize/modern-normalize.css';
// import 'simplelightbox/dist/simple-lightbox.min.css';

// const gallerySLBox = new SimpleLightbox('.gallery-list a');

// const formEl = document.getElementById('search-form');
// const galleryEl = document.getElementById('gallery-list');
// const loadMoreEl = document.querySelector('.load-more');
// const objectForObservation = document.querySelector('.object-for-observation');
// const infiniteScrollEl = document.querySelector('.infinite-scroll-input');
// const backdropLoaderEl = document.querySelector('.backdrop-loader');

// const IMAGE_PER_PAGE = 40;
// let searchName;
// let page;
// let totalPage;

// formEl.addEventListener('submit', onSubmit);

// addIntersectionObserver();

// async function onSubmit(e) {
//   e.preventDefault();
//   searchName = e.currentTarget.elements.searchQuery.value;
//   if (!searchName.trim()) {
//     await new Promise(resolve => {
//       Confirm.show(
//         '',
//         'Ви хочите здійснити пошук з порожнім полем?',
//         'Так',
//         'Ні',
//         () => {
//           resolve(); // Викликаємо resolve, щоб продовжити виконання коду
//         },
//         () => {
//           resetToDefault();
//           return;
//         },
//         {
//           width: '350px',
//         }
//       );
//     });
//   }

//   afterClickSubmit();
//   beforeSearch();
//   resetToDefault();

//   try {
//     objectForObservation.classList.remove('scroll-guard-show');
//     const { data } = await fetchImages(searchName, IMAGE_PER_PAGE, page);
//     totalPage = data.totalHits / IMAGE_PER_PAGE;

//     if (data.totalHits === data.total && data.total) {
//       Notify.success(
//         `Ура! Ми знайшли ${data.total} картинок. Вам доступні всі результати пошуку.`
//       );
//     } else if (data.totalHits) {
//       Notify.success(
//         `Ура! Ми знайшли ${data.total} картинок. Вам доступно ${data.totalHits} результатів пошуку.`
//       );
//     }

//     if (data.hits.length) {
//       objectForObservation.classList.add('object-for-observation-show');
//     }

//     onFetchSuccess(data);
//   } catch (error) {
//     console.log(error);
//     Notify.failure(
//       `На жаль, щось пішло не так. Будь ласка, спробуйте ще раз. ${error.message}, ${error.code}`
//     );
//     resetToDefault();
//   }
// }

// function afterClickSubmit() {
//   totalPage = 0;
//   galleryEl.innerHTML = '';
//   page = 1;
// }

// function beforeSearch() {
//   backdropLoaderEl.classList.add('backdrop-loader-show');
//   document.body.classList.add('body-overflow-hidden');
// }

// function resetToDefault() {
//   loadMoreEl.classList.remove('load-more-show');
//   backdropLoaderEl.classList.remove('backdrop-loader-show');
//   document.body.classList.remove('body-overflow-hidden');
// }

// function onFetchSuccess({ hits }) {
//   if (hits.length === 0) {
//     Notify.failure(
//       'На жаль, немає зображень, що відповідають вашому запиту. Будь ласка, спробуйте ще раз.'
//     );
//     resetToDefault();
//     return;
//   }
//   galleryEl.insertAdjacentHTML('beforeend', makeGalleryMarkup(hits));
//   gallerySLBox.refresh();
//   setTimeout(() => {
//     backdropLoaderEl.classList.remove('backdrop-loader-show');
//     document.body.classList.remove('body-overflow-hidden');
//   }, 500);
// }

// async function loadMoreImage() {
//   beforeSearch();

//   if (page > totalPage) {
//     return;
//   }

//   page += 1;

//   try {
//     const { data } = await fetchImages(searchName, IMAGE_PER_PAGE, page);
//     onFetchSuccess(data);
//     smoothScroll(galleryEl.firstElementChild);
//   } catch (error) {
//     console.log(error);
//     Notify.failure(
//       `На жаль, щось пішло не так. Будь ласка, спробуйте ще раз.${error.message}, ${error.code}`
//     );
//     resetToDefault();
//   }
// }

// function addIntersectionObserver() {
//   const options = {
//     rootMargin: '100px',
//     threshold: 1.0,
//   };
//   const observer1 = new IntersectionObserver(entries => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting) {
//         if (infiniteScrollEl.checked && page < totalPage) {
//           loadMoreImage();
//         } else if (!infiniteScrollEl.checked && page < totalPage) {
//           loadMoreEl.classList.add('load-more-show');
//           loadMoreEl.addEventListener('click', loadMoreImage);
//         } else if (totalPage) {
//           resetToDefault();
//           Notify.info('Вибачте, але ви досягли кінця результатів пошуку.');
//         }
//       }
//     });
//   }, options);

//   observer1.observe(document.querySelector('.object-for-observation'));
// }



// ============ #2 ================
import axios from "axios";
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";


const API_KEY = "33539049-cdce8fcccbdd2031fc74bbebc"; // Replace with your Pixabay API key

const searchForm = document.querySelector("#search-form");
const gallery = document.querySelector(".gallery");
const loadMoreBtn = document.querySelector(".load-more");
const lightbox = new SimpleLightbox(".gallery a");

let page = 1;
let currentSearchQuery = "";

searchForm.addEventListener("submit", e => {
  e.preventDefault();
  page = 1;
  currentSearchQuery = searchForm.searchQuery.value.trim();
  clearGallery();
  searchImages(currentSearchQuery, page);
});

loadMoreBtn.addEventListener("click", () => {
  page++;
  searchImages(currentSearchQuery, page);
});

function searchImages(query, page) {
  axios
    .get("https://pixabay.com/api/", {
      params: {
        key: API_KEY,
        q: query,
        image_type: "photo",
        orientation: "horizontal",
        safesearch: true,
        page: page,
        per_page: 40
      }
    })
    .then(response => {
      const { data } = response;
      const { hits, totalHits } = data;
      if (hits.length === 0) {
        if (page === 1) {
          showNotification("Sorry, there are no images matching your search query. Please try again.");
        } else {
          showNotification("We're sorry, but you've reached the end of search results.");
        }
      } else {
        showNotification(`Hooray! We found ${totalHits} images.`);
        displayImages(hits);
        if (hits.length < totalHits) {
          showLoadMoreButton();
        } else {
          hideLoadMoreButton();
        }
      }
    })
    .catch(error => {
      console.error("Error fetching images:", error);
    });
}

function displayImages(images) {
  const fragment = document.createDocumentFragment();
  images.forEach(image => {
    const card = createImageCard(image);
    fragment.appendChild(card);
  });
  gallery.appendChild(fragment);
  lightbox.refresh();
  scrollToNextPage();
}

function createImageCard(image) {
  const card = document.createElement("div");
  card.classList.add("photo-card");

  const link = document.createElement("a");
  link.href = image.largeImageURL;

  const img = document.createElement("img");
  img.src = image.webformatURL;
  img.alt = image.tags;
  img.loading = "lazy";

  const info = document.createElement("div");
  info.classList.add("info");

  const likes = createInfoItem("Likes", image.likes);
  const views = createInfoItem("Views", image.views);
  const comments = createInfoItem("Comments", image.comments);
  const downloads = createInfoItem("Downloads", image.downloads);

  info.appendChild(likes);
  info.appendChild(views);
  info.appendChild(comments);
  info.appendChild(downloads);

  link.appendChild(img);
  card.appendChild(link);
  card.appendChild(info);

  return card;
}

function createInfoItem(label, value) {
  const item = document.createElement("p");
  item.classList.add("info-item");
  item.innerHTML = `<b>${label}:</b> ${value}`;
  return item;
}

function clearGallery() {
  gallery.innerHTML = "";
}

function showLoadMoreButton() {
  loadMoreBtn.classList.remove("hidden");
}

function hideLoadMoreButton() {
  loadMoreBtn.classList.add("hidden");
}

function showNotification(message) {
  notiflix.Notify.info(message);
}

function scrollToNextPage() {
  const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth"
  });
}

/*
Замініть "your_api_key" у змінній API_KEY на свій унікальний ключ доступу до 
Pixabay API.

Цей код використовує axios для виконання HTTP-запитів, notiflix для відображення 
повідомлень, і SimpleLightbox для створення галереї зображень. Додаткові бібліотеки 
axios, notiflix та simplelightbox.min.js повинні бути підключені до HTML-файлу 
перед скриптом.

Додайте також наступний код у HTML-файл для підключення стилів SimpleLightbox:

html
Copy code
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/simplelightbox/2.1.0/simplelightbox.min.css"
/>
Використовуйте CSS для оформлення елементів інтерфейсу, включаючи форму пошуку, галерею зображень та кнопку "Load more".
*/