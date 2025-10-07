import { View, Text, Image, ImageSourcePropType } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
// import { icons } from '@/constants'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
// import { icons } from '@/constants'
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import {colors} from '@/constants';

const TabIcon = ({ source, focused }: { source: ImageSourcePropType, focused: boolean }) => (
  <View className="flex flex-row justify-center items-center rounded-full w-12 h-12">
    <View className="rounded-full w-12 h-12 items-center justify-center">
      <Image source={source} resizeMode='contain' className='w-7 h-7' />
    </View>
  </View >
)

const Layout = () => {
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: '#333333' }}>
      <Tabs initialRouteName='home' screenOptions={{
        tabBarActiveTintColor: "white", 
        tabBarInactiveTintColor: "white",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#333333',
          // borderColor: '#ffffff',
          borderRadius: 50,
          paddingBottom: 27,
          overflow: "hidden",
          marginHorizontal: 10,
          // Bottom inset for n
          bottom: bottom,
          marginBottom: 10,
          height: 65,
          display: "flex",
          justifyContent: "space-between",
          alignItems: 'center',
          flexDirection: 'row',
          position: 'absolute',
          borderWidth: 0, // Add this
          elevation: 0, // Add this for Android
        },
      }}>
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <FontAwesome5
                name="home"
                size={25}
                color={focused ? colors.primary : '#8E8E93'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="weight"
          options={{
            title: "Weight",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <FontAwesome5
                name="weight"
                size={25}
                color={focused ? colors.primary : '#8E8E93'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="activities"
          options={{
            title: "Activities",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <FontAwesome5
                name="running"
                size={25}
                color={focused ? colors.primary : '#8E8E93'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="food_tracker"
          options={{
            title: "Calorie Tracker",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <FontAwesome5
                name="utensils"
                size={25}
                color={focused ? colors.primary : '#8E8E93'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <FontAwesome5
                name="user"
                size={25}
                color={focused ? colors.primary : '#8E8E93'}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  )
}

export default Layout
