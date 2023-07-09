import { galleryMarkup } from './js/galleryMarkup';
import { imagesFetch } from './js/imagesFetch';
import { smoothScroll } from './js/smoothScroll';

import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Confirm } from 'notiflix/build/notiflix-confirm-aio';

import SimpleLightbox from 'simplelightbox';

import 'modern-normalize/modern-normalize.css';
import 'simplelightbox/dist/simple-lightbox.min.css';

const gallerySLBox = new SimpleLightbox('.gallery-list a');

const formEl = document.getElementById('search-form');
const galleryEl = document.getElementById('gallery-list');
const loadMoreEl = document.querySelector('.load-more');
const objectForObservation = document.querySelector('.object-for-observation');
const infiniteScrollEl = document.querySelector('.infinite-scroll-input');
const backdropLoaderEl = document.querySelector('.backdrop-loader');

const IMAGE_PER_PAGE = 40;
let searchName;
let page;
let totalPage;

formEl.addEventListener('submit', onSubmit);

addIntersectionObserver();

async function onSubmit(e) {
  e.preventDefault();
  searchName = e.currentTarget.elements.searchQuery.value;
  if (!searchName.trim()) {
    await new Promise(resolve => {
      Confirm.show(
        '',
        'Do you want to search with an empty field?',
        'Yes',
        'No',
        () => {
          resolve(); // Викликаємо resolve, щоб продовжити виконання коду
        },
        () => {
          resetToDefault();
          return;
        },
        {
          width: '350px',
        }
      );
    });
  }

  afterClickSubmit();
  beforeSearch();
  resetToDefault();

  try {
    objectForObservation.classList.remove('scroll-guard-show');
    const { data } = await imagesFetch(searchName, IMAGE_PER_PAGE, page);
    totalPage = data.totalHits / IMAGE_PER_PAGE;

    if (data.totalHits === data.total && data.total) {
      Notify.success(
        `Hooray! We found ${data.total} images. All search results are available to you.`
      );
    } else if (data.totalHits) {
      Notify.success(
        `Hooray! We found ${data.total} images. You have ${data.totalHits} of search results available.`
      );
    }

    if (data.hits.length) {
      objectForObservation.classList.add('object-for-observation-show');
    }

    onFetchSuccess(data);
  } catch (error) {
    console.log(error);
    Notify.failure(
      `Sorry, there are no images matching your search query. Please try again. ${error.message}, ${error.code}`
    );
    resetToDefault();
  }
}

function afterClickSubmit() {
  totalPage = 0;
  galleryEl.innerHTML = '';
  page = 1;
}

function beforeSearch() {
  backdropLoaderEl.classList.add('backdrop-loader-show');
  document.body.classList.add('body-overflow-hidden');
}

function resetToDefault() {
  loadMoreEl.classList.remove('load-more-show');
  backdropLoaderEl.classList.remove('backdrop-loader-show');
  document.body.classList.remove('body-overflow-hidden');
}

function onFetchSuccess({ hits }) {
  if (hits.length === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    resetToDefault();
    return;
  }
  galleryEl.insertAdjacentHTML('beforeend', galleryMarkup(hits));
  gallerySLBox.refresh();
  setTimeout(() => {
    backdropLoaderEl.classList.remove('backdrop-loader-show');
    document.body.classList.remove('body-overflow-hidden');
  }, 500);
}

async function loadMoreImage() {
  beforeSearch();

  if (page > totalPage) {
    return;
  }

  page += 1;

  try {
    const { data } = await imagesFetch(searchName, IMAGE_PER_PAGE, page);
    onFetchSuccess(data);
    smoothScroll(galleryEl.firstElementChild);
  } catch (error) {
    console.log(error);
    Notify.failure(
      `Sorry, something went wrong. Please try again.${error.message}, ${error.code}`
    );
    resetToDefault();
  }
}

function addIntersectionObserver() {
  const options = {
    rootMargin: '100px',
    threshold: 1.0,
  };
  const observer1 = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (infiniteScrollEl.checked && page < totalPage) {
          loadMoreImage();
        } else if (!infiniteScrollEl.checked && page < totalPage) {
          loadMoreEl.classList.add('load-more-show');
          loadMoreEl.addEventListener('click', loadMoreImage);
        } else if (totalPage) {
          resetToDefault();
          Notify.info("We're sorry, but you've reached the end of search results.");
        }
      }
    });
  }, options);

  observer1.observe(document.querySelector('.object-for-observation'));
}