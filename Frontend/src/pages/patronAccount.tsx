// // pages/profile/index.tsx
// import { useEffect, useState } from 'react';
// import axios from 'axios';

// interface User {
//     user_id: number;
//     name: string;
//     email: string;
//     password: string; // hashed password; handle securely
//     profilePic?: string; // URL of the profile picture
// }

// const ProfilePage = () => {
//     const [user, setUser] = useState<User | null>(null);
//     const [formData, setFormData] = useState<Omit<User, 'user_id'>>({
//         name: '',
//         email: '',
//         password: '',
//     });

//     useEffect(() => {
//         // Fetch user data
//         const fetchUserData = async () => {
//             const response = await axios.get('/api/user'); // Adjust the endpoint as needed
//             setUser(response.data);
//             setFormData({
//                 name: response.data.name,
//                 email: response.data.email,
//                 password: '', // Do not pre-fill password
//             });
//         };
//         fetchUserData();
//     }, []);

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         await axios.put('/api/user', formData); // Adjust the endpoint as needed
//         // Optionally: show a success message
//     };

//     const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             const formData = new FormData();
//             formData.append('profilePic', file);
//             await axios.post('/api/user/upload', formData); // Handle profile pic upload
//         }
//     };

//     return (
//         <div>
//             <h1>Your Profile</h1>
//             {user && (
//                 <form onSubmit={handleSubmit}>
//                     <div>
//                         <label>Name:</label>
//                         <input type="text" name="name" value={formData.name} onChange={handleChange} />
//                     </div>
//                     <div>
//                         <label>Email:</label>
//                         <input type="email" name="email" value={formData.email} onChange={handleChange} />
//                     </div>
//                     <div>
//                         <label>Password:</label>
//                         <input type="password" name="password" value={formData.password} onChange={handleChange} />
//                     </div>
//                     <div>
//                         <label>Profile Picture:</label>
//                         <input type="file" onChange={handleProfilePicChange} />
//                     </div>
//                     <button type="submit">Update Profile</button>
//                 </form>
//             )}
//         </div>
//     );
// };

// export default ProfilePage;
