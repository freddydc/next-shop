import React, { useContext, useEffect, useReducer, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import useStyles from '@components/Layout/styles';
import Layout from '@components/Layout/Layout';
import {
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@material-ui/core';
import { getError } from '@utils/error';
import type { GetServerSideProps } from 'next';
import { Controller, useForm } from 'react-hook-form';
import { StoreContext } from '@utils/store/Store';
import { useSnackbar } from 'notistack';
import { GError, Products } from '@utils/types';
import axios from 'axios';

type State = {
  loading: boolean;
  error: string;
  loadingUpdate?: boolean;
  loadingUpload?: boolean;
};

type Action = {
  type: string;
  payload?: string;
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'PRODUCT_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'PRODUCT_SUCCESS':
      return { ...state, loading: false, error: '' };
    case 'PRODUCT_FAIL':
      return { ...state, loading: false, error: action.payload as string };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true, errorUpdate: '' };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false, errorUpdate: '' };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true, errorUpload: '' };
    case 'UPLOAD_SUCCESS':
      return { ...state, loadingUpload: false, errorUpload: '' };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, errorUpload: action.payload };
    default:
      return state;
  }
}

const ProductEdit = ({ params }: { params: { id: string } }) => {
  const productId = params.id;
  const router = useRouter();
  const classes = useStyles();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [isFeatured, setIsFeatured] = useState(false);
  const { state } = useContext(StoreContext);
  const { userInfo } = state;

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();

  const initialState = {
    loading: true,
    error: '',
  };

  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, initialState);

  useEffect(() => {
    if (!userInfo) {
      router.push('/login');
    } else {
      const fetchData = async () => {
        try {
          dispatch({ type: 'PRODUCT_REQUEST' });
          const { data } = await axios.get(`/api/admin/products/${productId}`, {
            headers: { authorization: `Bearer ${userInfo.token}` },
          });
          dispatch({ type: 'PRODUCT_SUCCESS' });
          setValue('name', data.name);
          setValue('slug', data.slug);
          setValue('price', data.price);
          setValue('image', data.image);
          setValue('featuredImage', data.featuredImage || data.image);
          setIsFeatured(data.isFeatured);
          setValue('category', data.category);
          setValue('brand', data.brand);
          setValue('countInStock', data.countInStock);
          setValue('description', data.description);
        } catch (err) {
          dispatch({ type: 'PRODUCT_FAIL', payload: getError(err as GError) });
        }
      };
      fetchData();
    }
  }, []);

  const uploadHandler = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageField = 'image'
  ) => {
    const file = e.target.files![0];
    const bodyFormData = new FormData();
    bodyFormData.append('image', file);
    try {
      dispatch({ type: 'UPLOAD_REQUEST' });
      const { data } = await axios.post('/api/admin/upload', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: 'UPLOAD_SUCCESS' });
      setValue(imageField, data.secure_url);
      enqueueSnackbar('Image uploaded successfully', { variant: 'success' });
    } catch (err) {
      dispatch({ type: 'UPLOAD_FAIL', payload: getError(err as GError) });
      enqueueSnackbar(getError(err as GError), { variant: 'error' });
    }
  };

  const submitHandler = async ({
    name,
    slug,
    price,
    image,
    featuredImage,
    brand,
    category,
    countInStock,
    description,
  }: Products) => {
    closeSnackbar();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `/api/admin/products/${productId}`,
        {
          name,
          slug,
          price,
          image,
          brand,
          category,
          isFeatured,
          featuredImage,
          countInStock,
          description,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'UPDATE_SUCCESS' });
      enqueueSnackbar('Product updated successfully', { variant: 'success' });
      router.push('/admin/products');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(err as GError) });
      enqueueSnackbar(getError(err as GError), { variant: 'error' });
    }
  };

  return (
    <Layout title={`Edit Product ${productId.substring(18, 24)}`}>
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <NextLink href="/admin/dashboard" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Admin Dashboard" />
                </ListItem>
              </NextLink>
              <NextLink href="/admin/orders" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Orders" />
                </ListItem>
              </NextLink>
              <NextLink href="/admin/products" passHref>
                <ListItem selected button component="a">
                  <ListItemText primary="Products" />
                </ListItem>
              </NextLink>
              <NextLink href="/admin/users" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Users" />
                </ListItem>
              </NextLink>
            </List>
          </Card>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h1" variant="h1">
                  Edit Product {productId.substring(18, 24)}
                </Typography>
              </ListItem>
              <ListItem>
                {loading && <CircularProgress />}
                {error && (
                  <Typography className={classes.error}>{error}</Typography>
                )}
              </ListItem>
              <ListItem>
                <form
                  className={classes.form}
                  onSubmit={handleSubmit(submitHandler)}
                >
                  <List>
                    <ListItem>
                      <Controller
                        name="name"
                        control={control}
                        defaultValue=""
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            id="name"
                            label="Name"
                            fullWidth
                            error={Boolean(errors.name)}
                            helperText={errors.name ? 'Enter product name' : ''}
                            {...field}
                          />
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="slug"
                        control={control}
                        defaultValue=""
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            id="slug"
                            label="Slug"
                            fullWidth
                            error={Boolean(errors.slug)}
                            helperText={errors.slug ? 'Enter product slug' : ''}
                            {...field}
                          />
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="price"
                        control={control}
                        defaultValue=""
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            id="price"
                            label="Price"
                            fullWidth
                            error={Boolean(errors.price)}
                            helperText={
                              errors.price ? 'Enter product price' : ''
                            }
                            {...field}
                          />
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="image"
                        control={control}
                        defaultValue=""
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            id="image"
                            label="Image"
                            fullWidth
                            error={Boolean(errors.image)}
                            helperText={
                              errors.image ? 'Enter product image' : ''
                            }
                            {...field}
                          />
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      {loadingUpload ? (
                        <CircularProgress />
                      ) : (
                        <Button variant="contained" component="label">
                          Upload File
                          <input type="file" onChange={uploadHandler} hidden />
                        </Button>
                      )}
                    </ListItem>
                    <ListItem>
                      <FormControlLabel
                        label="Is Featured"
                        control={
                          <Checkbox
                            onClick={(
                              e: React.MouseEvent<HTMLButtonElement> & {
                                target: { checked: boolean };
                              }
                            ) => setIsFeatured(e.target.checked)}
                            checked={isFeatured}
                            name="isFeatured"
                          />
                        }
                      ></FormControlLabel>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="featuredImage"
                        control={control}
                        defaultValue=""
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            id="featuredImage"
                            label="Featured Image"
                            fullWidth
                            error={Boolean(errors.featuredImage)}
                            helperText={
                              errors.featuredImage ? 'Enter featured image' : ''
                            }
                            {...field}
                          />
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      {loadingUpload ? (
                        <CircularProgress />
                      ) : (
                        <Button variant="contained" component="label">
                          Upload File
                          <input
                            type="file"
                            onChange={(e) => uploadHandler(e, 'featuredImage')}
                            hidden
                          />
                        </Button>
                      )}
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="category"
                        control={control}
                        defaultValue=""
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            id="category"
                            label="Category"
                            fullWidth
                            error={Boolean(errors.category)}
                            helperText={
                              errors.category ? 'Enter product category' : ''
                            }
                            {...field}
                          />
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="brand"
                        control={control}
                        defaultValue=""
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            id="brand"
                            label="Brand"
                            fullWidth
                            error={Boolean(errors.brand)}
                            helperText={
                              errors.brand ? 'Enter product brand' : ''
                            }
                            {...field}
                          />
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="countInStock"
                        control={control}
                        defaultValue=""
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            id="countInStock"
                            label="Count in stock"
                            fullWidth
                            error={Boolean(errors.countInStock)}
                            helperText={
                              errors.countInStock
                                ? 'Enter product count in stock'
                                : ''
                            }
                            {...field}
                          />
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="description"
                        control={control}
                        defaultValue=""
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            id="description"
                            label="Description"
                            fullWidth
                            error={Boolean(errors.description)}
                            helperText={
                              errors.description
                                ? 'Enter product description'
                                : ''
                            }
                            {...field}
                          />
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                      >
                        Update
                      </Button>
                      {loadingUpdate && <CircularProgress />}
                    </ListItem>
                  </List>
                </form>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  return {
    props: { params },
  };
};

export default dynamic(() => Promise.resolve(ProductEdit), { ssr: false });
