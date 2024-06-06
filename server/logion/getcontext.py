from .models import Text
import re

def get_context(words, text_id: int, chunk:int) -> [str, str]:
    maxPrefixLength = 50
    maxSuffixLength = 50
    leftMaskIndex = words[0]['index']
    rightMaskIndex = words[-1]['index'] + 1
    text = Text.objects.get(id=text_id)
    chunk_string = text.body.split("***")[chunk]
    chunk_array = re.split('[\s]+', chunk_string)
    minChunkIndex = 0
    maxChunkIndex = 0
    # if we are closer to the beginning and need to add to the end:
    if leftMaskIndex < maxPrefixLength:
        diff = maxPrefixLength - leftMaskIndex
        maxPrefixLength -= diff
        maxSuffixLength += diff
        minChunkIndex = 0
        if maxSuffixLength + rightMaskIndex > len(chunk_array):
            maxChunkIndex = len(chunk_array) - 1
        else: 
            maxChunkIndex = rightMaskIndex + maxSuffixLength

    elif len(chunk_array) < maxSuffixLength + rightMaskIndex:
        diff = len(chunk_array) - (maxSuffixLength + rightMaskIndex)
        maxPrefixLength += diff
        maxChunkIndex = len(chunk_array) - 1
        if leftMaskIndex - maxPrefixLength < 0:
            minChunkIndex = 0
        else:
            minChunkIndex = leftMaskIndex - maxPrefixLength

    else:
        minChunkIndex = leftMaskIndex - maxPrefixLength
        maxChunkIndex = rightMaskIndex + maxSuffixLength

    

    # handle overflowing 
    
    leftText = chunk_array[minChunkIndex: leftMaskIndex]
    leftText = " ".join(leftText)
    rightText = chunk_array[rightMaskIndex: maxChunkIndex]
    rightText = " ".join(rightText)
    print(leftText, rightText)
    return [leftText, rightText]