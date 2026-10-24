import { apiSlice } from '../../api/apiSlice.js';

export const companyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCompanies: builder.query({
      query: (params) => ({
        url: '/companies',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((item) => ({
                type: 'Company',
                id: item.company?.id || item.id,
              })),
              { type: 'Company', id: 'LIST' },
            ]
          : [{ type: 'Company', id: 'LIST' }],
    }),

    getCompanyById: builder.query({
      query: (id) => `/companies/${id}`,
      providesTags: (result, error, id) => [{ type: 'Company', id }],
    }),

    createCompany: builder.mutation({
      query: (data) => ({
        url: '/companies',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Company', id: 'LIST' }],
    }),

    updateCompany: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/companies/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Company', id },
        { type: 'Company', id: 'LIST' },
      ],
    }),

    deleteCompany: builder.mutation({
      query: (id) => ({
        url: `/companies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Company', id: 'LIST' }],
    }),

    leaveCompany: builder.mutation({
      query: (id) => ({
        url: `/companies/${id}/leave`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Company', id: 'LIST' }],
    }),

    addOrRemoveMember: builder.mutation({
      query: ({ id, phoneNumber }) => ({
        url: `/companies/${id}/member`,
        method: 'POST',
        body: { phoneNumber },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Company', id },
        { type: 'Company', id: 'LIST' },
      ],
    }),

    updateMemberRole: builder.mutation({
      query: ({ id, memberId, role }) => ({
        url: `/companies/${id}/member/role`,
        method: 'PUT',
        body: { memberId, role },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Company', id },
        { type: 'Company', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCompaniesQuery,
  useGetCompanyByIdQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
  useLeaveCompanyMutation,
  useAddOrRemoveMemberMutation,
  useUpdateMemberRoleMutation,
} = companyApi;

export default companyApi;
