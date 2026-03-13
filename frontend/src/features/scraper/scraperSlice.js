import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const startScraping = createAsyncThunk(
  'scraper/startScraping',
  async ({ keyword, location }) => {
    const response = await axios.post(`${API_URL}/scraper/scrape`, {
      keyword,
      location,
      async: true,
    });
    return response.data;
  }
);

export const checkScrapingStatus = createAsyncThunk(
  'scraper/checkScrapingStatus',
  async ({ keyword, location }) => {
    const response = await axios.get(`${API_URL}/scraper/status`, {
      params: { keyword, location },
    });
    return response.data;
  }
);

export const testScraper = createAsyncThunk(
  'scraper/testScraper',
  async () => {
    const response = await axios.get(`${API_URL}/scraper/test`);
    return response.data;
  }
);

const scraperSlice = createSlice({
  name: 'scraper',
  initialState: {
    isLoading: false,
    error: null,
    scrapingStatus: null,
    testResult: null,
    lastScrapedData: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearScrapingStatus: (state) => {
      state.scrapingStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start scraping
      .addCase(startScraping.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startScraping.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastScrapedData = action.payload.data;
        state.error = null;
      })
      .addCase(startScraping.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Check scraping status
      .addCase(checkScrapingStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkScrapingStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scrapingStatus = action.payload.data;
      })
      .addCase(checkScrapingStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Test scraper
      .addCase(testScraper.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(testScraper.fulfilled, (state, action) => {
        state.isLoading = false;
        state.testResult = action.payload;
      })
      .addCase(testScraper.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError, clearScrapingStatus } = scraperSlice.actions;
export default scraperSlice.reducer;