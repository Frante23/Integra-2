"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';
import React from 'react';
import Image from 'next/image';
import Popup from '../components/Popup'; 
import { NavbarOperario } from '../components/NavBarOperario';

export default function Perfil() {
    const [UserName, setUserName] = useState('');
    const [UserId, setUserId] = useState('');
    const [isVip, setIsVip] = useState<boolean | null>(null);
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchUserInfo = async () => {
        try {
            const response = await fetch('/api/auth/GetInfoOperario', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Error al obtener la información del usuario');
            }

            const data = await response.json();
            console.log(data);
            setUserInfo(data.user);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    useEffect(() => {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));
        if (!token) {
            router.push('/');
            return;
        }

        const tokenValue = token.split('=')[1];

        try {
            const decodedToken = jwt.decode(tokenValue);
            console.log("Token Decodificado:", decodedToken);

            if (decodedToken && typeof decodedToken === 'object') {
                if (decodedToken.username) {
                    setUserName(decodedToken.username);
                } else {
                    console.warn("UserName no encontrado en el token.");
                }
                if (decodedToken.vip !== undefined) {
                    setIsVip(decodedToken.vip);
                }
                if (decodedToken.userId) {
                    setUserId(decodedToken.userId);
                }
            } else {
                console.warn("El token decodificado no es un objeto válido.");
            }
        } catch (error) {
            console.error("Error al decodificar el token:", error);
            router.push('/');
        }
    }, [router]);

    const Logout = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (response.ok) {
                console.log('Sesión cerrada:', data);
                document.cookie = 'token=; Max-Age=0; path=/';
                router.push(data.redirectUrl || '/');
            } else {
                console.error('Error al cerrar sesión:', data.message);
            }
        } catch (error) {
            console.error('Error en la solicitud de cierre de sesión:', error);
        }
    };

    return (
        <div>
            <NavbarOperario />
            <div className="main">
                <div className="container">
                    <h1 className="title">MI PERFIL</h1>
                    <div className='Rounded-img'>
                        {userInfo ? (
                            <img src={userInfo.url} alt="Foto de perfil" className="rounded-full w-full h-full object-cover" />
                        ) : (
                            <p>Cargando imagen de perfil...</p>
                        )}
                    </div>
                    <h2 className='font-bold'>Bienvenido, {UserName}!</h2>
                    <button className="w-[90%] font-bold p-3 text-lg mt-5 border-0 rounded-full cursor-pointer bg-[#D9D9D9] text-black">
                        <a href="/EditProfileOperario">Editar Perfil</a>
                    </button>
                    <form onSubmit={Logout} className="flex justify-center w-[90%] font-bold text-lg mt-5 border-0 rounded-full cursor-pointer bg-[#5785A4] text-black">
                        <button type="submit" className="w-[90%] flex justify-center items-center">
                            Cerrar sesión
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
