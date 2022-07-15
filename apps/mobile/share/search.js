import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { db } from "../app/common/database";
import { getElevation } from "../app/utils";
import { useShareStore } from "./store";

export const Search = ({ close, getKeyboardHeight, quicknote }) => {
  const colors = useShareStore((state) => state.colors);
  const setAppendNote = useShareStore((state) => state.setAppendNote);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchKeyword = useRef(null);
  const { height } = useWindowDimensions();
  const notes = useRef(null);
  const timer = useRef(null);
  const inputRef = useRef();
  const insets =
    Platform.OS === "android"
      ? { top: StatusBar.currentHeight }
      : useSafeAreaInsets();

  const onSelectItem = async (item) => {
    if (item.locked) {
      return;
    }
    setAppendNote(item);
    close();
  };

  const onSearch = async () => {
    if (!notes.current) {
      await db.init();
      await db.notes.init();
      notes.current = db.notes.all;
    }
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    timer.current = setTimeout(async () => {
      if (!searchKeyword.current) {
        setResults([]);
        setResults(db.notes.all);
        return;
      }
      setSearching(true);
      setResults(await db.lookup.notes(notes.current, searchKeyword.current));
      setSearching(false);
    }, 500);
  };

  useEffect(() => {
    (async () => {
      await db.init();
      await db.notes.init();
      notes.current = db.notes.all;
      setResults(notes.current);
    })();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  const renderItem = ({ item }) =>
    !item.locked ? (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onSelectItem(item)}
        style={{
          height: 50,
          paddingHorizontal: 12
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            color: colors.pri,
            fontFamily: "OpenSans-SemiBold",
            fontSize: 15
          }}
        >
          {item.title}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: colors.icon,
            fontSize: 12,
            fontFamily: "OpenSans-Regular"
          }}
        >
          {item.headline}
        </Text>
      </TouchableOpacity>
    ) : null;

  let extra = quicknote
    ? {
        marginTop: -insets.top,
        paddingTop: insets.top
      }
    : {};
  return (
    <View
      style={{
        position: "absolute",
        top: Platform.OS === "android" ? 20 : 0,
        backgroundColor: colors.bg,
        borderRadius: quicknote ? 0 : 10,
        width: quicknote ? "100%" : "95%",
        minHeight: 250,
        alignSelf: "center",
        overflow: "hidden",
        zIndex: 999,
        ...getElevation(quicknote ? 1 : 5),
        ...extra
      }}
    >
      <View
        style={{
          flexShrink: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 12,
          marginBottom: 10,
          height: 50
        }}
      >
        <TextInput
          ref={inputRef}
          placeholder="Search for a note"
          placeholderTextColor={colors.placeholder}
          style={{
            fontSize: 15,
            fontFamily: "OpenSans-Regular",
            width: "85%"
          }}
          onChangeText={(value) => {
            searchKeyword.current = value;
            onSearch();
          }}
          onSubmitEditing={onSearch}
        />
        {searching ? (
          <ActivityIndicator size={25} color={colors.icon} />
        ) : (
          <Icon
            name="magnify"
            color={colors.pri}
            size={25}
            onPress={onSearch}
          />
        )}
      </View>

      <FlatList
        data={results}
        style={{
          maxHeight: height - getKeyboardHeight()
        }}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              height: 200
            }}
          >
            <Text
              style={{
                fontFamily: "OpenSans-Regular",
                color: colors.icon
              }}
            >
              {searchKeyword.current
                ? `No results found for "${searchKeyword.current}"`
                : "Search for a note to append to it."}
            </Text>
          </View>
        }
      />
    </View>
  );
};