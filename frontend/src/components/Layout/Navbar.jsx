import React from 'react'
import { Link } from 'react-router-dom'
import { navItems } from '../../static/data'
import styles from '../../styles/styles'
import { useTranslation } from 'react-i18next'

const Navbar = ({ active }) => {
    const { i18n } = useTranslation();

    return (
        <div className={`block 800px:${styles.noramlFlex} pr-12 bg-black rounded-lg p-4`}>
            {
                navItems.map((i, index) => (
                    <div className='flex' key={index}>
                        <Link to={i.url}
                            className={`${active === index + 1 ? "text-orange-500 font-bold" : "text-white hover:text-gray-300"} pb-[30px] 800px:pb-0 font-[500] px-6 cursor-pointer transition-colors duration-200`}
                        >
                            {i.title[i18n.language] || i.title.en}
                        </Link>
                    </div>
                ))
            }
        </div>
    )
}

export default Navbar