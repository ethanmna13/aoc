require 'rails_helper'

RSpec.describe 'User Sessions', type: :request do
  let!(:user) { create(:user) }
  let(:json_response) { JSON.parse(response.body) }
  let(:valid_login_params) { { user: { email: user.email, password: '1234abcd' } } }
  let(:invalid_login_params) { { user: { email: user.email, password: 'wrongpassword' } } }

  describe 'POST /api/v1/users/sign_in' do
    context 'with valid credentials' do
      it 'logs in the user and returns user data' do
        post '/api/v1/users/sign_in', params: valid_login_params, as: :json

        expect(response).to have_http_status(:ok)
        expect(response.body).to include('Logged in successfully')
        expect(json_response['user']['email']).to eq(user.email)
        expect(json_response['user']['role']).to eq(user.role.to_s)
        expect(json_response['user']['account_status']).to eq(user.account_status.to_s)
      end
    end

    context 'with valid credentials and inactive account' do
      let(:inactive_user) { create(:user, :inactive) }
      let(:valid_login_params_inactive) { { user: { email: inactive_user.email, password: '1234abcd' } } }

      it 'logs in the user and updates account status to active' do
        post '/api/v1/users/sign_in', params: valid_login_params_inactive, as: :json

        expect(response).to have_http_status(:ok)
        expect(json_response['user']['account_status']).to eq('active')
        expect(inactive_user.reload.account_status).to eq('active')
      end
    end

    context 'with invalid credentials' do
      it 'returns an error message' do
        post '/api/v1/users/sign_in', params: invalid_login_params, as: :json

        expect(response).to have_http_status(:unauthorized)
        expect(response.body).to include('Invalid email or password')
      end
    end
  end

  describe 'DELETE /api/v1/users/sign_out' do
    context 'when user is logged in' do
      before do
        sign_in user
      end

      it 'logs out the user successfully' do
        delete '/api/v1/users/sign_out', as: :json

        expect(response).to have_http_status(:ok)
        expect(response.body).to include('Logged out successfully')
      end
    end
  end
end
