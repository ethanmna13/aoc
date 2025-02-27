require 'rails_helper'

RSpec.describe SubTask, type: :model do
  describe 'Validations' do
    let(:user) { create(:user) }
    let(:main_task) { create(:main_task, users_id: user.id) }

    it 'is valid with a name, users_id, and main_tasks_id' do
      sub_task = build(:sub_task, name: 'Sub Task 1', users_id: user.id, main_tasks_id: main_task.id)
      expect(sub_task).to be_valid
    end

    it 'is invalid without a name' do
      sub_task = build(:sub_task, name: nil, users_id: user.id, main_tasks_id: main_task.id)
      expect(sub_task).to_not be_valid
      expect(sub_task.errors[:name]).to include("can't be blank")
    end

    it 'is invalid without a users_id' do
      sub_task = build(:sub_task, name: 'Sub Task 1', users_id: nil, main_tasks_id: main_task.id)
      expect(sub_task).to_not be_valid
      expect(sub_task.errors[:users_id]).to include("can't be blank")
    end

    it 'is invalid without a main_tasks_id' do
      sub_task = build(:sub_task, name: 'Sub Task 1', users_id: user.id, main_tasks_id: nil)
      expect(sub_task).to_not be_valid
      expect(sub_task.errors[:main_tasks_id]).to include("can't be blank")
    end
  end

  describe 'Associations' do
    it { should belong_to(:main_task).with_foreign_key('main_tasks_id') }
    it { should belong_to(:user).class_name('User').with_foreign_key('users_id') }
    it { should have_many(:assigned_sub_task) }
    it { should have_many_attached(:attachments) }
  end
end
