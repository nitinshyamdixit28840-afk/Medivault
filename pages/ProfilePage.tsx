
import React, { useState } from 'react';

const ProfilePage: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    
    const [profile, setProfile] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        age: 35
    });

    const [editCache, setEditCache] = useState(profile);

    const handleEdit = () => {
        setEditCache(profile);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setProfile(editCache);
        setIsEditing(false);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="container mx-auto max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Profile & Settings</h1>
                {!isEditing && (
                    <button onClick={handleEdit} className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
                        Edit Profile
                    </button>
                )}
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <form onSubmit={handleSave}>
                    <div className="flex items-center space-x-6 mb-8">
                        <img src="https://picsum.photos/seed/user/100/100" alt="User Avatar" className="w-24 h-24 rounded-full" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
                            <p className="text-gray-500">{profile.email}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" id="name" name="name" value={profile.name} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full bg-gray-100 disabled:bg-gray-100 enabled:bg-white border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                            <input type="number" id="age" name="age" value={profile.age} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full bg-gray-100 disabled:bg-gray-100 enabled:bg-white border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Settings</h3>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <span>Enable Voice Chat</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                </label>
                            </div>
                        </div>
                        {isEditing && (
                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                    Save Changes
                                </button>
                            </div>
                        )}
                        {showSuccess && (
                            <div className="text-center p-3 bg-green-100 text-green-800 rounded-lg">
                                Profile saved successfully!
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;