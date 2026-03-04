// import { ErrorMessages } from '@utils-types';
import { setCookie, getCookie } from '@/shared/lib/utils/cookie';
import { QUERY_ENDPOINTS } from '@constants';
import type {
  TRefreshAuthResponse,
  TCityResponse,
  TGetAllUsers,
  TRegisterData,
  TRegisterResponse,
  TServerResponse,
  TTokens,
  TUserResponse,
  TLoginCredentials,
  TGetAuthUserById,
  TUserSkillResponse,
  TSkillData,
  TUserAllSkillsResponse,
  TLikeResponse,
  TDefaultSkills,
  Tdelta,
  TFavoriteResponse
} from './types';
import type { TUser } from '@/entities/user';
import { transformKeysToLowercase } from '@/shared/lib/utils/transformApiKeysToLowercase';
import type { TUserSkill } from '@/entities/userSkill';
import type { TSkills } from '@/entities/skills';
import type { TUserSkillLight } from '@/shared/lib/types';

const URL = import.meta.env.VITE_SUPABASE_URL;
const APIKEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export class Api {
  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }
  private baseUrl: string;
  private apiKey: string;

  private checkResponse = <T>(res: Response): Promise<T> =>
    res.ok ? res.json() : res.json().then((err) => Promise.reject(err));

  // Функция авторизации через refresh токен
  private refreshToken = (): Promise<TRefreshAuthResponse> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return Promise.reject(new Error('No refresh token available'));
    }

    return fetch(`${this.baseUrl}/${QUERY_ENDPOINTS.getUserRefresh}`, {
      method: 'POST',
      headers: {
        apikey: this.apiKey,
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    })
      .then((res) => {
        const result =  this.checkResponse<TRefreshAuthResponse>(res);
        return result;
      })
      .then((refreshData) => {
        // Сохраняем токены!
        localStorage.setItem('refresh_token', refreshData.refresh_token);
        setCookie('access_token', refreshData.access_token);
        return refreshData; // ВОЗВРАЩАЕМ данные
      })
      .catch((error) => Promise.reject(new Error('Failed to refresh token')));
  };

  // Отдельный метод для auth/v1/user по id через supabase uuid
  private fetchAuthUser = async (): Promise<TUserResponse> => {
    let accessToken = getCookie('access_token');
    try {
      const res = await fetch(`${this.baseUrl}/${QUERY_ENDPOINTS.authUser}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken || ''}`,
          apikey: this.apiKey
        }
      });
      // -------
      if (res.ok) {
      return await this.checkResponse<TUserResponse>(res);
      }
      //-----

      if (res.status === 401 || res.status === 403) {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          return Promise.reject(new Error('Ваша сессия истекла'));
        }

        try {
          await this.refreshToken();
          const newAccessToken = getCookie('access_token');

          const retryRes = await fetch(
            `${this.baseUrl}/${QUERY_ENDPOINTS.authUser}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
                apikey: this.apiKey
              }
            }
          );
          const result = await this.checkResponse<TUserResponse>(retryRes);
          console.log(result)
          return result
        } catch (error) {
          return Promise.reject(
            new Error('Session expired. Please login again.')
          );
        }
      }

      if (res.ok) {
        return await this.checkResponse<TUserResponse>(res);
      } else {
        return Promise.reject(new Error(`HTTP error! status: ${res.status}`));
      }
    } catch (error) {
      return Promise.reject(error);
    }
  };

// ------------------------------
  private createUserProfile = (
    data: Omit<TRegisterData, 'password'>,
    accessToken: string
    ): Promise<{ profile: TUser; message: string }> => {
      const { email, ...dataWithoutEmail } = data;
      const toLowerCaseData = transformKeysToLowercase(dataWithoutEmail);

      return fetch(`${this.baseUrl}/${QUERY_ENDPOINTS.registerUser}`, {
        method: 'POST',
        headers: {
          apikey: this.apiKey,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(toLowerCaseData)
      })
        .then((res) => res.json())
        .then((response) => {
          if (response.success && response.data) {
            return {
              profile: response.data,
              message: response.message
            };
          }
          throw new Error(response.message || 'Failed to create profile');
        });
    };
// ------------------------------


  // Запрос на получение пользователя из auth
  getUserApi = async (): Promise<TServerResponse<TUser> | null> => {
    try {
      const authData = await this.fetchAuthUser();
      const userId = authData.id;
      const response = await fetch(
        `${this.baseUrl}/${QUERY_ENDPOINTS.getUserByAuthId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getCookie('access_token')}`,
            apikey: this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            auth_id: userId
          })
        }
      );

      const result = await response.json();

      //  Проверяем структуру ответа
      if (!result.success) {
        throw new Error(result.message || 'Пользователь не найден');
      }
      return result.data;
    } catch (error) {
      console.error(error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes('сессия истекла') ||
        errorMessage.includes('Session expired')
      ) {
        return null; // 👈 ТИХО ВОЗВРАЩАЕМ null!
      }

      return Promise.reject(error);
    }
  };

  registerUserApi = (data: TRegisterData): Promise<TRegisterResponse> => {
    const { email, password, ...profileData } = data;

    return fetch(`${this.baseUrl}/${QUERY_ENDPOINTS.signUp}`, {
      method: 'POST',
      headers: {
        apikey: this.apiKey,
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({ email, password })
    })
      .then(async (res) => {
        const authData = await res.json();

        if (!res.ok) {
          if (res.status === 422 || res.status === 400) {
            throw {
              success: false,
              error_code: 'user_already_exists',
              message: 'Пользователь с таким email уже зарегистрирован '
            };
          }
        }
        if (!authData.access_token) {
          throw {
            success: false,
            error_code: 'user_already_exists',
            message: 'Пользователь с таким email уже зарегистрирован'
          };
        }

        const tokens: TTokens = {
          access_token: authData.access_token,
          refresh_token: authData.refresh_token
        };

        return this.createUserProfile(
          { email, ...profileData },
          authData.access_token
        )
          .then(({ profile, message }) => ({
            success: true,
            profile,
            message,
            ...tokens
          }))
          .catch((error) => {
            throw {
              success: false,
              message: error.message
            };
          });
      })
      .catch((error) => {
        // Здесь можно дополнительно обработать ошибку(и так рабоатет я оставил)
        console.error('Registration error:', error);
        return error;
      });
  };

  updateUserProfileApi = async (
      profileData: Partial<TUser>
    ): Promise<TGetAuthUserById> => {
      try {
        // Получаем актуальные токены и auth данные
        const authData = await this.fetchAuthUser();
        const userId = authData.id;

        // Получаем _id пользователя из таблицы
        const userResponse = await fetch(
          `${this.baseUrl}/${QUERY_ENDPOINTS.getUserByAuthId}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${getCookie('access_token')}`,
              apikey: this.apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ auth_id: userId })
          }
        );

        const userResult = await userResponse.json();

        if (!userResult.success) {
          throw new Error(userResult.message || 'Пользователь не найден');
        }

        // Преобразуем ключи в нижний регистр для БД
        const lowerCaseData = transformKeysToLowercase(profileData);

        // СОЗДАЕМ ОБЪЕКТ С ИМЕНОВАННЫМИ ПАРАМЕТРАМИ
        const functionParams = {
          _id: userResult.data._id,                    // _id
          name: lowerCaseData.name || null,              // name
          email: lowerCaseData.email || null,             // email
          dateofbirth: lowerCaseData.dateofbirth || null, // dateofbirth
          gender: lowerCaseData.gender || null,           // gender
          location: lowerCaseData.location || null,       // location
          aboutme: lowerCaseData.aboutme || null,         // aboutme
          favoriteskills: lowerCaseData.favoriteskills || null, // favoriteskills
          tolearn: lowerCaseData.tolearn || null,         // tolearn
          canteach: lowerCaseData.canteach || null,       // canteach
          avatarpic: lowerCaseData.avatarpic || null      // avatarpic
        };

        const response = await fetch(
          `${this.baseUrl}/${QUERY_ENDPOINTS.updateUserProfile}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${getCookie('access_token')}`,
              apikey: this.apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(functionParams) // Теперь это объект!
          }
        );

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message);
        }

        return result;
      } catch (error) {
        console.error('Ошибка обновления профиля:', error);

        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (
          errorMessage.includes('Session expired') ||
          errorMessage.includes('сессия истекла')
        ) {
          return Promise.reject(
            new Error('Сессия истекла. Пожалуйста, войдите снова')
          );
        }

        return Promise.reject(error);
      }
    };

  // Добавление нового навыка
  addNewUserSkillApi = async (
    skillData: TSkillData
  ): Promise<TUserSkillResponse> => {
    try {
      // Получаем актуальные токены и auth данные
      const authData = await this.fetchAuthUser();
      const userId = authData.id; // UUID из auth

      // Получаем _id пользователя из твоей таблицы
      const userResponse = await fetch(
        `${this.baseUrl}/${QUERY_ENDPOINTS.getUserByAuthId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getCookie('access_token')}`,
            apikey: this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ auth_id: userId })
        }
      );

      const userResult = await userResponse.json();

      if (!userResult.success) {
        throw new Error(userResult.message || 'Пользователь не найден');
      }

      // Добавляем новый навык
      const response = await fetch(
        `${this.baseUrl}/${QUERY_ENDPOINTS.addNewUserSkill}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getCookie('access_token')}`,
            apikey: this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: skillData.title,
            description: skillData.description,
            type: skillData.type,
            category: skillData.category,
            subcategory: skillData.subcategory,
            images: skillData.images || []
          })
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    } catch (error) {
      console.error('Ошибка добавления навыка:', error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes('Session expired') ||
        errorMessage.includes('сессия истекла')
      ) {
        return Promise.reject(
          new Error('Сессия истекла. Пожалуйста, войдите снова')
        );
      }

      return Promise.reject(error);
    }
  };

  // Запрос всех городов
  getCitiesApi = () =>
    fetch(`${this.baseUrl}/${QUERY_ENDPOINTS.getAllCities}`, {
      headers: {
        apikey: this.apiKey
      }
    })
      .then((res) => this.checkResponse<TCityResponse>(res))
      .then((data) => {
        if (data?.success) return data.data;
        return Promise.reject(data);
      });

  // Запрос всех скилов (список )
  getDefaultSkillsApi = async (): Promise<TSkills> => {
    try {
      const response = await fetch(
        `${this.baseUrl}/${QUERY_ENDPOINTS.getDefaultSkills}`,
        {
          method: 'GET',
          headers: {
            apikey: this.apiKey
          }
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Ошибка получения навыков пользователя:', error);
      return Promise.reject(error);
    }
  };
  // Запрос всех пользователей
  getAllUsersApi = (): Promise<TUser[]> =>
    fetch(`${this.baseUrl}/${QUERY_ENDPOINTS.getAllUsers}`, {
      headers: {
        apikey: this.apiKey
      }
    })
      .then((res) => this.checkResponse<TGetAllUsers>(res))
      .then((data) => {
        if (data?.success) return data.data;
        return Promise.reject(data);
      });

  // Запрос на пользователя по id
  getUserByIdApi = (id: TUser['_id']) =>
    fetch(`${this.baseUrl}/${QUERY_ENDPOINTS.getUserById}`, {
      method: 'POST',
      headers: {
        apikey: this.apiKey,
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({ id: id })
    })
      .then((res) => this.checkResponse<TGetAllUsers>(res))
      .then((data) => {
        if (data?.success) return data.data;
        return Promise.reject(data);
      });

  // Функция логина
  loginApi = async (
    credentials: TLoginCredentials
  ): Promise<{ user: TUser; tokens: TTokens }> => {
    try {
      // Логинимся в Supabase Auth
      const authResponse = await fetch(
        `${this.baseUrl}/${QUERY_ENDPOINTS.loginUser}`,
        {
          method: 'POST',
          headers: {
            apikey: this.apiKey,
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
          })
        }
      );

      if (!authResponse.ok) {
        const error = await authResponse.json();
        throw new Error(error.msg || 'Ошибка входа. Проверьте email и пароль');
      }

      const authData: TRefreshAuthResponse = await authResponse.json();

      // Получаем данные пользователя из таблицы по auth_user_id
      const userResponse = await fetch(
        `${this.baseUrl}/rest/v1/rpc/get_user_by_auth_id`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authData.access_token}`,
            apikey: this.apiKey,
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({
            auth_id: authData.user.id
          })
        }
      );

      const userResult: TGetAuthUserById = await userResponse.json();

      // Если пользователь не найден - выбрасываем ошибку!
      if (!userResult.success) {
        throw new Error(
          'Профиль пользователя не найден. Сначала зарегистрируйтесь.'
        );
      }

      // Возвращаем данные
      return {
        user: userResult.data,
        tokens: {
          access_token: authData.access_token,
          refresh_token: authData.refresh_token
        }
      };
    } catch (error) {
      console.error(' Ошибка входа:', error);
      return Promise.reject(error);
    }
  };

  // Запрос за получением конкретного навыка по id
  getUserSkillByIdApi = async (
    skillId: string
  ): Promise<TUserSkillResponse> => {
    try {
      const response = await fetch(
        `${this.baseUrl}/${QUERY_ENDPOINTS.getSkillById}`,
        {
          method: 'POST',
          headers: {
            apikey: this.apiKey,
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({
            skill_id: skillId
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      return result;
    } catch (error) {
      console.error('Ошибка получения навыков пользователя:', error);
      return Promise.reject(error);
    }
  };

  // Запрос на получение всех Предложений навыков
  getUserListSkillsApi = async (): Promise<TUserSkillLight[]> => {
    try {
      const response = await fetch(
        `${this.baseUrl}/${QUERY_ENDPOINTS.getAllUserSkills}`,
        {
          method: 'GET',
          headers: {
            apikey: this.apiKey
          }
        }
      );

      const result: TUserAllSkillsResponse = await response.json();
      // Проверяем наличие поля success и его значение
      if (!result.success) {
        return Promise.reject(
          new Error(result.message || 'Failed to fetch user skills')
        );
      }

      return result.data;
    } catch (error) {
      console.error('Ошибка получения навыков пользователя:', error);
      return Promise.reject(error);
    }
  };

  // Ставим лайк только авторизованный пользователь
  updateSkillLikesApi = async (
    skillId: string,
    delta: Tdelta
  ): Promise<TLikeResponse> => {
    try {
      const response = await fetch(
        `${this.baseUrl}/${QUERY_ENDPOINTS.likeUserSkill}`,
        {
          method: 'POST',
          headers: {
            apikey: this.apiKey,
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getCookie('access_token')}` // 👈 Токен для авторизации
          },
          body: JSON.stringify({
            skill_id: skillId,
            delta: delta
          })
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Ошибка обновления лайка:', error);
      return Promise.reject(error);
    }
  };

  // Изменение на сервере списка Избранного у юзера
  toggleFavoriteApi = async (
    skillId: string
  ): Promise<TFavoriteResponse> => {
    try {
      const response = await fetch(
        `${this.baseUrl}/${QUERY_ENDPOINTS.toggleFavorite}`, // нужно создать эндпоинт
        {
          method: 'POST',
          headers: {
            apikey: this.apiKey,
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getCookie('access_token')}`
          },
          body: JSON.stringify({
            skill_id: skillId
            // user_id берется из токена на сервере через auth.uid()
          })
        }
      );

      const result = await response.json();
      console.log(result)
      return result;
    } catch (error) {
      console.error('Ошибка переключения избранного:', error);
      return Promise.reject(error);
    }
  };


}



export const api = new Api(URL, APIKEY);
