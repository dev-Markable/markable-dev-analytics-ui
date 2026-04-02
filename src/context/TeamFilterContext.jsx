import React, { createContext, useContext, useState, useEffect } from 'react';

// Список участников команды маркировки
export const TEAM_MEMBERS = [
    'kiril.aksyutik@x5.ru',
    'stepan.ermakov@x5.ru',
    'vikto.zhigunov@x5.ru',
    'aleksand.dorofeev@x5.ru',
    'tatiana.matvienko@x5.ru',
    'vladisla.gritsev@x5.ru',
    'nikit.tomashov@x5.ru',
    'ily.galochkin@x5.ru',
    'boris.osechinskiy@x5.ru'
];

const TeamFilterContext = createContext();

export const useTeamFilter = () => {
    const context = useContext(TeamFilterContext);
    if (!context) {
        throw new Error('useTeamFilter must be used within TeamFilterProvider');
    }
    return context;
};

export const TeamFilterProvider = ({ children }) => {
    // Загружаем состояние из localStorage
    const [isTeamFilterEnabled, setIsTeamFilterEnabled] = useState(() => {
        const saved = localStorage.getItem('teamFilterEnabled');
        return saved === 'true';
    });

    // Сохраняем состояние в localStorage
    useEffect(() => {
        localStorage.setItem('teamFilterEnabled', isTeamFilterEnabled);
    }, [isTeamFilterEnabled]);

    // Функция фильтрации данных по команде
    const filterByTeam = (data, emailField = 'email') => {
        if (!isTeamFilterEnabled) return data;
        if (!data || !Array.isArray(data)) return data;

        return data.filter(item => {
            const email = item[emailField]?.toLowerCase();
            return TEAM_MEMBERS.some(member => member.toLowerCase() === email);
        });
    };

    // Функция фильтрации одного объекта (для профиля пользователя)
    const isInTeam = (email) => {
        if (!isTeamFilterEnabled) return true;
        return TEAM_MEMBERS.some(member => member.toLowerCase() === email?.toLowerCase());
    };

    return (
        <TeamFilterContext.Provider value={{
            isTeamFilterEnabled,
            setIsTeamFilterEnabled,
            filterByTeam,
            isInTeam,
            teamMembers: TEAM_MEMBERS
        }}>
            {children}
        </TeamFilterContext.Provider>
    );
};