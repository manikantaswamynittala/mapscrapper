import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchBusinesses = createAsyncThunk(
  'business/fetchBusinesses',
  async ({ page = 1, limit = 50, keyword, location } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (keyword) params.append('keyword', keyword);
    if (location) params.append('location', location);
    
    const response = await axios.get(`${API_URL}/businesses?${params}`);
    return response.data;
  }
);

export const searchBusinesses = createAsyncThunk(
  'business/searchBusinesses',
  async ({ keyword, location }) => {
    const response = await axios.get(`${API_URL}/businesses/search`, {
      params: { keyword, location },
    });
    return response.data;
  }
);

export const exportBusinesses = createAsyncThunk(
  'business/exportBusinesses',
  async ({ keyword, location, exportType = 'search', hasWebsite }) => {
    const response = await axios.post(`${API_URL}/businesses/export`, {
      keyword,
      location,
      exportType,
      hasWebsite,
    });
    return response.data;
  }
);

export const deleteBusiness = createAsyncThunk(
  'business/deleteBusiness',
  async (id) => {
    await axios.delete(`${API_URL}/businesses/${id}`);
    return id;
  }
);

export const fetchSearchHistory = createAsyncThunk(
  'business/fetchSearchHistory',
  async () => {
    const response = await axios.get(`${API_URL}/businesses/history/searches`);
    return response.data;
  }
);

const businessSlice = createSlice({
  name: 'business',
  initialState: {
    businesses: [],
    searchResults: [],
    searchHistory: [],
    pagination: {
      page: 1,
      limit: 50,
      total: 0,
      pages: 0,
    },
    isLoading: false,
    error: null,
    exportResult: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearExportResult: (state) => {
      state.exportResult = null;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch businesses
      .addCase(fetchBusinesses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusinesses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.businesses = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchBusinesses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Search businesses
      .addCase(searchBusinesses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchBusinesses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.data;
        state.error = null;
      })
      .addCase(searchBusinesses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Export businesses
      .addCase(exportBusinesses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportBusinesses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exportResult = action.payload;
        state.error = null;
      })
      .addCase(exportBusinesses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Delete business
      .addCase(deleteBusiness.fulfilled, (state, action) => {
        state.businesses = state.businesses.filter(
          business => business._id !== action.payload
        );
        state.searchResults = state.searchResults.filter(
          business => business._id !== action.payload
        );
      })
      // Fetch search history
      .addCase(fetchSearchHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSearchHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchHistory = action.payload.data;
      })
      .addCase(fetchSearchHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError, clearExportResult, setPage } = businessSlice.actions;
export default businessSlice.reducer;