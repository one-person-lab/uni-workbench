import { useState, useEffect } from 'react';
import { AssetStorageService, ProductStorageService, AuthorProfileStorageService } from '../assets/storage';
import { createAsset, createSkill, createPrompt, createWorkflow, createTemplate, createTutorial, createCase, createProduct, createAuthorProfile } from '../assets/models';

/**
 * 资产数据访问 Hook
 */
export function useAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = () => {
    try {
      setLoading(true);
      const data = AssetStorageService.loadAssets();
      setAssets(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const saveAsset = (asset) => {
    try {
      AssetStorageService.saveAsset(asset);
      loadAssets();
      return true;
    } catch (err) {
      setError(err);
      return false;
    }
  };

  const deleteAsset = (assetId) => {
    try {
      AssetStorageService.deleteAsset(assetId);
      loadAssets();
      return true;
    } catch (err) {
      setError(err);
      return false;
    }
  };

  return { assets, loading, error, saveAsset, deleteAsset, loadAssets };
}

/**
 * 产品数据访问 Hook
 */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    try {
      setLoading(true);
      const data = ProductStorageService.loadProducts();
      setProducts(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = (product) => {
    try {
      ProductStorageService.saveProduct(product);
      loadProducts();
      return true;
    } catch (err) {
      setError(err);
      return false;
    }
  };

  const deleteProduct = (productId) => {
    try {
      ProductStorageService.deleteProduct(productId);
      loadProducts();
      return true;
    } catch (err) {
      setError(err);
      return false;
    }
  };

  return { products, loading, error, saveProduct, deleteProduct, loadProducts };
}

/**
 * 作者档案数据访问 Hook
 */
export function useAuthorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    try {
      setLoading(true);
      const data = AuthorProfileStorageService.loadAuthorProfile();
      setProfile(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = (profileData) => {
    try {
      AuthorProfileStorageService.saveAuthorProfile(profileData);
      loadProfile();
      return true;
    } catch (err) {
      setError(err);
      return false;
    }
  };

  return { profile, loading, error, saveProfile, loadProfile };
}