import { configureStore } from '@reduxjs/toolkit';
import scraperSlice from '../features/scraper/scraperSlice';
import businessSlice from '../features/business/businessSlice';

export const store = configureStore({
  reducer: {
    scraper: scraperSlice,
    business: businessSlice,
  },
});