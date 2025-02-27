require 'rails_helper'

RSpec.describe MainTask, type: :model do
  describe 'Validations' do
    let(:user) { create(:user) }

    it 'is valid with a name and user_id' do
      main_task = build(:main_task, name: 'Task 1', users_id: user.id)
      expect(main_task).to be_valid
    end

    it 'is invalid without a name' do
      main_task = build(:main_task, name: nil, users_id: user.id)
      expect(main_task).to_not be_valid
      expect(main_task.errors[:name]).to include("can't be blank")
    end

    it 'is invalid without a user_id' do
      main_task = build(:main_task, name: 'Task 1', users_id: nil)
      expect(main_task).to_not be_valid
      expect(main_task.errors[:users_id]).to include("can't be blank")
    end
  end

  describe 'Associations' do
    it { should belong_to(:user).class_name('User').with_foreign_key('users_id') }
    it { should have_many(:sub_tasks).with_foreign_key('main_tasks_id').dependent(:destroy) }
    it { should have_many(:assigned_main_tasks).with_foreign_key('main_tasks_id') }
    it { should have_many_attached(:attachments) }
  end

  describe 'Ransackable Attributes' do
    it 'returns the correct ransackable attributes' do
      expect(MainTask.ransackable_attributes).to match_array(%w[name users_id])
    end
  end
end
