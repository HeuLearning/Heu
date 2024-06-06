# # # -*- coding: utf-8 -*-
from transformers import BertTokenizer, BertForMaskedLM
import torch
import numpy as np
tokenizer = BertTokenizer.from_pretrained("cabrooks/LOGION-50k_wordpiece")
model = BertForMaskedLM.from_pretrained("cabrooks/LOGION-50k_wordpiece")







sm = torch.nn.Softmax(dim=1) # In order to construct word probabilities, we will employ softmax.
# # # torch.set_grad_enabled(False) # Since we are not training, we disable gradient calculation.
import re
import requests

import nltk

def get_top_suggestions(suggestions, og_text):
  keep_suggestions = []
  for s in suggestions:
    s['token_str'] = re.sub('##', '', s['token_str'])
    print(nltk.edit_distance(og_text, s['token_str']), og_text, s['token_str'])
    if nltk.edit_distance(og_text, s['token_str']) <= 2:
      keep_suggestions.append({"word": s['token_str'], "probability": s['score']})

  return keep_suggestions


def clean_text(text):

  # acute with breathing
  # α
  # text = re.sub('[\u1F00-\u1F07]', 'α', text)
  # # Α
  # text = re.sub('[\u1F08-\u1F0F]', 'A', text)
  # # ε
  # text = re.sub('[\u1F10-\u1F15]', 'ε', text)
  # # Ε
  # text = re.sub('[\u1F18-\u1F1D]', 'Ε', text)
  # # η
  # text = re.sub('[\u1F20-\u1F27]', 'η', text)
  # # Η
  # text = re.sub('[\u1F28-\u1F2F]', 'Η', text)
  # # ι
  # text = re.sub('[\u1F30-\u1F37]+', 'ι', text)
  # # Ι
  # text = re.sub('[\u1F38-\u1F3F]', 'Ι', text)
  # # ο
  # text = re.sub('[\u1F40-\u1F45]', 'ο', text)
  # # Ο
  # text = re.sub('[\u1F48-\u1F4D]', 'Ι', text)
  # # υ
  # text = re.sub('[\u1F50-\u1F55]', 'υ', text)
  # # Υ
  # text = re.sub('[\u1F58-\u1F5D]', 'Υ', text)
  # # ω
  # text = re.sub('[\u1F60-\u1F67]+', 'ω', text)
  # # Ω
  # text = re.sub('[\u1F68-\u1F6F]', 'Ω', text)
  # # α
  # text = re.sub('[\u1F70-\u1F71]', 'α', text)
  # # ε
  # text = re.sub('[\u1F72-\u1F73]', 'ε', text)
  # # η
  # text = re.sub('[\u1F74-\u1F75]', 'η', text)
  # # ι
  # text = re.sub('[\u1F76-\u1F77]+', 'ι', text)
  # text = re.sub('[\u03AF]+', 'ι', text)

  # # ο
  # text = re.sub('[\u1F78-\u1F79]', 'ο', text)
  # # υ
  # text = re.sub('[\u1F7A-\u1F7B]', 'υ', text)
  # # ω
  # text = re.sub('[\u1F7C-\u1F7D]+', 'ω', text)
  # # ᾳ
  # text = re.sub('[\u1F80-\u1F87]', 'α', text)
  # # ῃ
  # text = re.sub('[\u1F90-\u1F97]', 'η', text)
  # # ῳ
  # text = re.sub('[\u1FA0-\u1FA7]', 'η', text)
  # # ᾳ
  # text = re.sub('[\u1FB0-\u1FB7]', 'α', text)
  # # ῃ
  # text = re.sub('[\u1FC2-\u1FC7]', 'η', text)
  # # ι
  # text = re.sub('[\u1FD0-\u1FD7]+', 'ι', text)
  # # υ
  # text = re.sub('[\u1FE0-\u1FE3]', 'υ', text)
  # # ρ
  # text = re.sub('[\u1FE4-\u1FE5]', 'ρ', text)
  # # υ
  # text = re.sub('[\u1FE6-\u1FE7]', 'υ', text)
  # # Υ
  # text = re.sub('[\u1FE8-\u1FEB]', 'Υ', text)
  # # Ρ
  # text = re.sub('[\u1FEC]', 'Ρ', text)
  # # ῳ
  # text = re.sub('[\u1FF0-\u1FF7]+', 'ω', text)
  # # Ο
  # text = re.sub('[\u1FF8-\u1FF9]', 'Ο', text)
  # # Ω
  # text = re.sub('[\u1FFA-\u1FFB]', 'Ω', text)

  # d = {ord('\N{COMBINING ACUTE ACCENT}'):None}
  # text = ud.normalize('NFD', text).translate(d)
  text = remove_diacritics(text)
  # lunate sigmas at the end of the word
  text = re.sub(r'c(?!\w)', 'ς', text)
  # all remaining lunate sigmas
  text = re.sub(r'ϲ', 'σ', text)
  text = re.sub(r'Ϲ', 'Σ', text)

  # remove titles should I do this?

  # remove dots under letters
  text = re.sub("\u0323", "", text)

  # remove  ͜
  text = re.sub("͜", "", text)

  # replace ⸏word or ⸐word with [UNK]
  text = re.sub("[⸏⸐][\u0370-\u03ff\u1f00-\u1fff\[\]']*", " [UNK] ", text)

  # remove meter suggestions e.g. <–⏑⏑–⏓>
  text = re.sub("<[–⏔⏕⏓⏑]*>[\u0370-\u03ff\u1f00-\u1fff\']*", " [UNK] ", text)

  # remove meter suggestions not in arrows
  text = re.sub('[–⏔⏓⏑⏕]', "", text)
  
  # replace words with internal ellipses
  text = re.sub(f'[\u0370-\u03ff\u1f00-\u1fff\']+[\.]+((\[[" "\.]*\])|[\u0370-\u03ff\u1f00-\u1fff\'\.\[])+', " [UNK] ", text)

  # replace ellipses all by themselves with[UNK]
  text = re.sub('" "\.{2,}" "', " [UNK] ", text)

  # remove words starting and ending with [ ]
  text = re.sub(f'[" "]\[[" ".]*\][\u0370-\u03ff\u1f00-\u1fff.\']*\[[" ".]*\]', " [UNK] ", text)

  # remove words starting with [ ]
  text = re.sub(f'\[[" ".]*\][\u0370-\u03ff\u1f00-\u1fff\.\'\[\]]*', " [UNK] ", text)

  # remove words ending with [ ]
  text = re.sub(f'[\u0370-\u03ff\u1f00-\u1fff.\']*\[[" ".]*\]', " [UNK] ", text)

  # replace words with internal [ ]
  text = re.sub('[\u0370-\u03ff\u1f00-\u1fff\.\[\]\']+(\[[" "\.]*\])+((\[[" "\.]*\])|[\u0370-\u03ff\u1f00-\u1fff\'\.\[\]])*', " [UNK] ", text)

  # remove words ending with [
  text = re.sub(f'[\u0370-\u03ff\u1f00-\u1fff\.\']+\[\s', "[UNK]", text)

  # remove elipses beginning words e.g. .word
  text = re.sub('[\.]+[\u0370-\u03ff\u1f00-\u1fff.\'\[\]]', " [UNK] ", text)

  # remove daggers of desparation
  # text = re.sub('†.*†', " [UNK] ", text)

  # remove any remaining angle brackets < >
  text = re.sub(f'[<>]', "", text)

  # remove any remaining square brackets []
  text = re.sub(f'[\[\]]', "", text)

  # add back on the parentheses here
  text = re.sub('(UNK)', '[UNK]', text)

  # remove dashes that represent unfinished words
  # e.g. word-? 
  text = re.sub('[\u0370-\u03ff\u1f00-\u1fff\']+-\?', " [UNK] ", text)

  # unsplit words across lines
  text = re.sub('-\n[\s]*', "", text)

  # remove (= #)
  text = re.sub(f'[\([=" "1-9]*\)]', "", text)

  # remove parentheses around words
  text = re.sub(f'[\(\)]', "", text)

  # remove weird characters:
  text = re.sub("(([1-9]+,)|([1-9]+-)|(—\s—)|[†|>⸖※<0-9⌞⌟⊗⟦⟧»*\\\{\}])", "", text)
  random_character_list = ['†', '|', '>', '⸖', '※', '<', '1', '2', '0', '7', '5', '4', '8', '3', '⌞', '⌟' , '9', '6', '⊗', '⟦', '⟧', '»', '*', '{', '}']
  
  return text


def get_model_results(text):
  aws_access_key_id = os.environ.get('AWS_ACCESS_KEY_ID')
  aws_secret_access_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
  runtime = boto3.client('runtime.sagemaker', aws_access_key_id=aws_access_key_id,
      aws_secret_access_key=aws_secret_access_key, region_name='us-east-1')
  # role = iam_client.get_role(RoleName='SageMakerLogionClient')['Role']['Arn']
  # sess = sagemaker.Session()
  # text1 = '''Χρονογραφία πονηθεῖσα τῷ πανσόφῳ μοναχῷ Μιχαὴλ τῷ ὑπερτίμῳ, ἱστοροῦσα'''
  # text2 = ''' πράξεις τῶν βασιλέων, τοῦ τε Βασιλείου καὶ Κωνσταντίνου τῶν πορφυρογεννήτων, τοῦ τε μετ' αὐτοὺς Ῥωμανοῦ τοῦ Ἀργυροπώλου, τοῦ μετ' ἐκεῖνον Μιχαὴλ τοῦ '''
  payload = {
    "inputs": f'{text}',
    "parameters": {"top_k": 1000}
  }
  payload_json = json.dumps(payload)

  result  = runtime.invoke_endpoint(
      EndpointName='huggingface-pytorch-inference-2023-09-10-01-38-05-396',
      Body=payload_json,
      ContentType='application/json'
  )
  # Parse the resul
  response_body = result['Body'].read()
  response_json = json.loads(response_body)
  return response_json




# Get top k suggestions for each masked position:
def argkmax_2(array, k, prefix='', dim=0): # Return indices of the 1st through kth largest values of an array, given prefix
  indices = []
  new_prefixes = []
  added = 0
  ind = 1
  while added < k:
    if ind > len(array[0]):
      break
    val = torch.kthvalue(-array, ind, dim=dim).indices.cpu().numpy().tolist()
    if prefix != '':
      cur_tok = tokenizer.convert_ids_to_tokens(val[0]).replace('##', '')
      trunc_prefix = prefix[:min(len(prefix), len(cur_tok))]
      if not cur_tok.startswith(trunc_prefix):
        ind += 1
        continue
    else:
      cur_tok = ''
    indices.append(val)
    if len(cur_tok) >= len(prefix):
      new_prefixes.append('')
    else:
      new_prefixes.append(prefix[len(cur_tok):])
    ind += 1
    added += 1
  return torch.tensor(indices), new_prefixes

# gets n predictions / probabilities for a single masked token , by default, the first masked token
def get_n_preds_2(token_ids, n, prefix, masked_ind, fill_inds, cur_prob=1, text:str=''):
  mask_positions = (token_ids.squeeze() == tokenizer.mask_token_id).nonzero().flatten().tolist()
  for i in range(len(fill_inds)):
    token_ids.squeeze()[mask_positions[i]] = fill_inds[i]
  #print(len(mask_positions), len(fill_inds))
  # model_id = min(len(mask_positions) - len(fill_inds) - 1, 4)
  logits = model(token_ids).logits.squeeze(0)
  mask_logits = logits[[[masked_ind]]]
  # {word: "asdfa", probability: "as;flkjasd;lfk"}
  probabilities = np.zeros([50000, 1])
  list_dict_probabilites = get_model_results(text)
  if len(list_dict_probabilites) != 1000:
    list_dict_probabilites = list_dict_probabilites[0]
  for p in list_dict_probabilites:
    probabilities[p['token']] = p['score']
    # probabilities[0] = p.
  # for thing in things:
    # probabilites.append(thing.probability)
  # probabilities = [0.123123, 0.12341234, 0.123412341234]
  # tokens = ["asdfasdf", "Asdfasdf", "asdfa;sldkfjasdf"]
  probabilities = sm(mask_logits)
  arg1, prefixes = argkmax_2(probabilities, n, prefix, dim=1)
  suggestion_ids = arg1.squeeze().tolist()
  n_probs = probabilities.squeeze()[suggestion_ids]
  n_probs = torch.mul(n_probs, cur_prob).tolist()
  new_fill_inds = [fill_inds + [i] for i in suggestion_ids]
  return tuple(zip(new_fill_inds, n_probs, prefixes)) 

def beam_search_2(token_ids, beam_size, prefix='', breadth=100, text:str=''):
  mask_positions = (token_ids.detach().clone().squeeze() == tokenizer.mask_token_id).nonzero().flatten().tolist()
  #print(len(mask_positions))
  num_masked = len(mask_positions)
  cur_preds = get_n_preds_2(token_ids.detach().clone(), beam_size, prefix, mask_positions[0], [], text=text)
  #for c in range(len(cur_preds)):
    #print(tokenizer.convert_ids_to_tokens(cur_preds[c][0][0]))

  for i in range(num_masked - 1):
    #print(i)
    candidates = []
    for j in range(len(cur_preds)):
      candidates += get_n_preds_2(token_ids.detach().clone(), breadth, cur_preds[j][2], mask_positions[i + 1], cur_preds[j][0], cur_preds[j][1], text=text)
    candidates.sort(key=lambda k:k[1],reverse=True)
    if i != num_masked - 2:
      cur_preds = candidates[:beam_size]
    else:
      cur_preds = candidates[:breadth]
  return cur_preds


def get_results_2 (text1, text2, og_text, num_toks):
  og_text_string = ''
  for w in og_text:
    og_text_string += f" {w['word']}"
  og_text = clean_text(og_text_string).lower().strip()
  text1 = clean_text(text1)
  text2 = clean_text(text2)
  token_masks = ''
  for i in range(num_toks):
    token_masks += f' {tokenizer.mask_token} ' 
  text = text1 + " " + token_masks + " " + text2
  token_ids = tokenizer.encode(text, return_tensors='pt')
  beam_size = 20
  if num_toks == 1:
    beam_size = 1000
  tokens = beam_search_2(token_ids, beam_size, prefix='', breadth=100, text=text)
  strings = []
  for s in tokens:
    first_tok = tokenizer.convert_ids_to_tokens(s[0])[0]
    # if not first_tok.startswith('συν'):
      # continue
    converted = tokenizer.convert_ids_to_tokens(s[0])
    converted.reverse()
    # print(converted)
    tok_arr = tokenizer.convert_ids_to_tokens(s[0])
    st = ''
    for t in tok_arr:
      t = re.sub('[#]+', '', t)
      st += t
    if nltk.edit_distance(st, og_text) <= 1:
      strings.append({'word': st, 'probability': str(s[1])})
      # strings.append(st + " probability: " + str(s[1]))
  return strings


# Get top k suggestions for each masked position:
def argkmax(array, k, prefix='', dim=0): # Return indices of the 1st through kth largest values of an array, given prefix
  indices = []
  new_prefixes = []
  added = 0
  ind = 1
  while added < k:
    if ind > len(array[0]):
      break
    val = torch.kthvalue(-array, ind, dim=dim).indices.cpu().numpy().tolist()
    if prefix != '':
      cur_tok = tokenizer.convert_ids_to_tokens(val[0]).replace('##', '')
      trunc_prefix = prefix[:min(len(prefix), len(cur_tok))]
      if not cur_tok.startswith(trunc_prefix):
        ind += 1
        continue
    else:
      cur_tok = ''
    indices.append(val)
    if len(cur_tok) >= len(prefix):
      new_prefixes.append('')
    else:
      new_prefixes.append(prefix[len(cur_tok):])
    ind += 1
    added += 1
  return torch.tensor(indices), new_prefixes

# gets n predictions / probabilities for a single masked token , by default, the first masked token
def get_n_preds(token_ids, n, prefix, masked_ind, fill_inds, cur_prob=1):
  mask_positions = (token_ids.squeeze() == tokenizer.mask_token_id).nonzero().flatten().tolist()
  for i in range(len(fill_inds)):
    token_ids.squeeze()[mask_positions[i]] = fill_inds[i]

  #print(len(mask_positions), len(fill_inds))
  # model_id = min(len(mask_positions) - len(fill_inds) - 1, 4)
  logits = model(token_ids).logits.squeeze(0)
  mask_logits = logits[[[masked_ind]]]
  probabilities = sm(mask_logits)
  arg1, prefixes = argkmax(probabilities, n, prefix, dim=1)
  suggestion_ids = arg1.squeeze().tolist()
  n_probs = probabilities.squeeze()[suggestion_ids]
  n_probs = torch.mul(n_probs, cur_prob).tolist()
  new_fill_inds = [fill_inds + [i] for i in suggestion_ids]
  return tuple(zip(new_fill_inds, n_probs, prefixes)) 

def beam_search(token_ids, beam_size, prefix='', breadth=100):
  mask_positions = (token_ids.detach().clone().squeeze() == tokenizer.mask_token_id).nonzero().flatten().tolist()
  #print(len(mask_positions))
  num_masked = len(mask_positions)
  cur_preds = get_n_preds(token_ids.detach().clone(), beam_size, prefix, mask_positions[0], [])
  #for c in range(len(cur_preds)):
    #print(tokenizer.convert_ids_to_tokens(cur_preds[c][0][0]))

  for i in range(num_masked - 1):
    #print(i)
    candidates = []
    for j in range(len(cur_preds)):
      candidates += get_n_preds(token_ids.detach().clone(), breadth, cur_preds[j][2], mask_positions[i + 1], cur_preds[j][0], cur_preds[j][1])
    candidates.sort(key=lambda k:k[1],reverse=True)
    if i != num_masked - 2:
      cur_preds = candidates[:beam_size]
    else:
      cur_preds = candidates[:breadth]
  return cur_preds


# Get top 5 suggestions for each masked position:
def argkmax_right(array, k, suffix='', dim=0): # Return indices of the 1st through kth largest values of an array
  indices = []
  new_suffixes = []
  added = 0
  ind = 1
  while added < k:
    if ind > len(array[0]):
      break
    val = torch.kthvalue(-array, ind, dim=dim).indices.cpu().numpy().tolist()
    if suffix != '':
      cur_tok = tokenizer.convert_ids_to_tokens(val[0]).replace('##', '')
      trunc_suffix = suffix[len(suffix) - min(len(suffix), len(cur_tok)):]
      if not cur_tok.endswith(trunc_suffix):
        ind += 1
        continue
    else:
      cur_tok = ''
    indices.append(val)
    if len(cur_tok) >= len(suffix):
      new_suffixes.append('')
    else:
      new_suffixes.append(suffix[:len(suffix) - len(cur_tok)])
    ind += 1
    added += 1
  return torch.tensor(indices), new_suffixes

# gets n predictions / probabilities for a single masked token , by default, the first masked token
def get_n_preds_right(token_ids, n, suffix, masked_ind, fill_inds, cur_prob=1):
  mask_positions = (token_ids.squeeze() == tokenizer.mask_token_id).nonzero().flatten().tolist()
  # fill in the current guessed tokens
  for i in range(len(fill_inds)):
    token_ids.squeeze()[mask_positions[len(mask_positions) - i - 1]] = fill_inds[i]
  #print(len(mask_positions), len(fill_inds))
  # model_id = min(len(mask_positions) - len(fill_inds) - 1, 4)
  model_id = 0
  #print(model_id)
  # model = models[model_id]
  logits = model(token_ids).logits.squeeze(0)
  mask_logits = logits[[[masked_ind]]]
  probabilities = sm(mask_logits)
  arg1, suffixes = argkmax_right(probabilities, n, suffix, dim=1)
  suggestion_ids = arg1.squeeze().tolist()
  n_probs = probabilities.squeeze()[suggestion_ids]
  n_probs = torch.mul(n_probs, cur_prob).tolist()
  new_fill_inds = [fill_inds + [i] for i in suggestion_ids]
  return tuple(zip(new_fill_inds, n_probs, suffixes)) 

def beam_search_right(token_ids, beam_size, suffix='', breadth=100):
  mask_positions = (token_ids.detach().clone().squeeze() == tokenizer.mask_token_id).nonzero().flatten().tolist()
  num_masked = len(mask_positions)
  cur_preds = get_n_preds_right(token_ids.detach().clone(), beam_size, suffix, mask_positions[-1], [])
  #for c in range(len(cur_preds)):
    #print(tokenizer.convert_ids_to_tokens(cur_preds[c][0][0]))
  for i in range(num_masked - 1, 0, -1):
    #print('here: ' + str(i))
    candidates = []
    for j in range(len(cur_preds)):
      candidates += get_n_preds_right(token_ids.detach().clone(), breadth, cur_preds[j][2], mask_positions[i - 1], cur_preds[j][0], cur_preds[j][1])
    candidates.sort(key=lambda k:k[1],reverse=True)
    if i != 1:
      cur_preds = candidates[:beam_size]
    else:
      cur_preds = candidates[:breadth]
  for tokens, probability, _ in cur_preds:
    tokens.reverse()
  return cur_preds

def display_word(toks):
  s = ''
  first_tok = True
  for tok in toks:
    is_suffix = tok.startswith('##')
    if is_suffix: tok = '·' + tok[2:]  # remove suffix hashtags
    elif not first_tok: s += ' '
    
    s += tok
    
    first_tok = False
  return s


# text_test = 'ἐπείπερ ἐν τῷ γένει'
# toks = tokenizer.encode(text_test, return_tensors='pt')
# print(tokenizer.convert_ids_to_tokens(toks[0]))





def get_strings(text, num_toks):
  text = re.sub('[****]', tokenizer.mask_token, text)
  # print(text)
  tokens = tokenizer.encode(text, return_tensors='pt')
  sugs = beam_search(tokens, num_toks, '')
  strings = []
  for s in sugs:
    first_tok = tokenizer.convert_ids_to_tokens(s[0])[0]
    # if not first_tok.startswith('συν'):
      # continue
    converted = tokenizer.convert_ids_to_tokens(s[0])
    converted.reverse()
    # print(converted)
    # print(tokenizer.convert_ids_to_tokens(s[0]))
    # print(s[1])
    strings.append(s)
  strings = display_word(strings)
  return strings

import unicodedata as ud

import unicodedata

def remove_diacritics(input_string):
        # Normalize the string to decomposed form (NFD) to separate diacritics
    normalized_string = unicodedata.normalize('NFD', input_string)

# Use a list comprehension to filter out characters that are not diacritics
    filtered_chars = [char for char in normalized_string if not unicodedata.combining(char)]

# Join the filtered characters back into a string
    cleaned_string = ''.join(filtered_chars)

    return cleaned_string

def remove_accents_breathings(text):

  # acute with breathing
  # α
  text = re.sub('[\u1F00-\u1F07]+', 'α', text)
  # Α
  text = re.sub('[\u1F08-\u1F0F]+', 'A', text)
  # ε
  text = re.sub('[\u1F10-\u1F15]+', 'ε', text)
  # Ε
  text = re.sub('[\u1F18-\u1F1D]+', 'Ε', text)
  # η
  text = re.sub('[\u1F20-\u1F27]+', 'η', text)
  # Η
  text = re.sub('[\u1F28-\u1F2F]+', 'Η', text)
  # ι
  text = re.sub('[\u1F30-\u1F37]+', 'ι', text)
  # Ι
  text = re.sub('[\u1F38-\u1F3F]+', 'Ι', text)
  # ο
  text = re.sub('[\u1F40-\u1F45]', 'ο', text)
  # Ο
  text = re.sub('[\u1F48-\u1F4D]', 'Ι', text)
  # υ
  text = re.sub('[\u1F50-\u1F55]', 'υ', text)
  # Υ
  text = re.sub('[\u1F58-\u1F5D]', 'Υ', text)
  # ω
  text = re.sub('[\u1F60-\u1F67]', 'ω', text)
  # Ω
  text = re.sub('[\u1F68-\u1F6F]', 'Ω', text)
  # α
  text = re.sub('[\u1F70-\u1F71]', 'α', text)
  # ε
  text = re.sub('[\u1F72-\u1F73]', 'ε', text)
  # η
  text = re.sub('[\u1F74-\u1F75]', 'η', text)
  # ι
  text = re.sub('[\u1F76-\u1F77]+', 'ι', text)
  # ο
  text = re.sub('[\u1F78-\u1F79]', 'ο', text)
  # υ
  text = re.sub('[\u1F7A-\u1F7B]', 'υ', text)
  # ω
  text = re.sub('[\u1F7C-\u1F7D]', 'ω', text)
  # ᾳ
  text = re.sub('[\u1F80-\u1F87]', 'α', text)
  # ῃ
  text = re.sub('[\u1F90-\u1F97]', 'η', text)
  # ῳ
  text = re.sub('[\u1FA0-\u1FA7]', 'ω', text)
  # ᾳ
  text = re.sub('[\u1FB0-\u1FB7]', 'α', text)
  # ῃ
  text = re.sub('[\u1FC2-\u1FC7]', 'η', text)
  # ι
  text = re.sub('[\u1FD0-\u1FD7]+', 'ι', text)
  # υ
  text = re.sub('[\u1FE0-\u1FE3]', 'υ', text)
  # ρ
  text = re.sub('[\u1FE4-\u1FE5]', 'ρ', text)
  # υ
  text = re.sub('[\u1FE6-\u1FE7]', 'υ', text)
  # Υ
  text = re.sub('[\u1FE8-\u1FEB]', 'Υ', text)
  # Ρ
  text = re.sub('[\u1FEC]', 'Ρ', text)
  # ῳ
  text = re.sub('[\u1FF0-\u1FF7]', 'ω', text)
  # Ο
  text = re.sub('[\u1FF8-\u1FF9]', 'Ο', text)
  # Ω
  text = re.sub('[\u1FFA-\u1FFB]', 'Ω', text)
  return text




def all_possibilities(text1:str, text2:str, og_text:str, num_tokens:int, right=False) -> str:
  fix = ''
  strings = []  
  output = ''
  token_masks = ''
  # text1 = ''
  # text2 = f'πρώτης σελίδος χορὸν ἐξ Ἑλικῶνος ἐλθεῖν εἰς ἐμὸν ἦτορ ἐπεύχομαι εἵνεκ᾿ ἀοιδῆς, ἣν νέον ἐν δέλτοισιν ἐμοῖς ἐπὶ γούνασι θῆκα, δῆριν ἀπειρεσίην, πολεμόκλονον ἔργον Ἄρηος, εὐχόμενος μερόπεσσιν ἐς οὔατα πᾶσι βαλέσθαι, πῶς μύες ἐν βατράχοισιν ἀριστεύσαντες ἔβησαν, γηγενέων ἀνδρῶν μιμούμενοι ἔργα Γιγάντων, ὡς λόγος ἐν θνητοῖσιν ἔην· τοίην δ᾿ ἔχεν ἀρχήν. μῦς ποτε διψαλέος, γαλέης κίνδυνον ἀλύξας πλησίον, ἐν λίμνηι λίχνον προσέθηκε γένειον, ὕδατι τερπόμενος μελιηδέϊ· τὸν δὲ κατεῖδεν λιμνόχαρις πολύφημος, ἔπος δ᾿ ἐφθέγξατο τοῖον· “ξεῖνε, τίς εἶ; πόθεν ἦλθες ἐπ᾿ ἠιόνα; τίς δέ σ᾿ ὁ φύσας; πάντα δ᾿ ἀλήθευσον, μὴ ψευδόμενόν σε νοήσω. εἰ γάρ σε γνοίην φίλον ἄξιον, ἐς δόμον ἄξω, δῶρα δέ τοι δώσω ξεινήϊα πολλὰ καὶ ἐσθλά. εἶμι δ᾿ ἐγὼ βασιλεὺς Φυσίγναθος, ὃς κατὰ λίμνην τιμῶμαι βατράχων ἡγούμενος ἤματα πάντα· καί με πατὴρ Πηλεὺς ἀνεθρέψατο, Ὑδρομεδούσηι μιχθεὶς ἐν φιλότητι παρ᾿ ὄχθας Ἠριδανοῖο. καὶ σὲ δ᾿ ὁρῶ καλόν τε καὶ ἄλκιμον ἔξοχον ἄλλων.”'
  og_text_string = ''
  for w in og_text:
    og_text_string += f" {w['word']}"
  og_text = clean_text(og_text_string).lower().strip()
  text1 = clean_text(text1)
  text2 = clean_text(text2)
  for i in range(num_tokens):
    token_masks += f' {tokenizer.mask_token} ' 
  text = text1 + " " + token_masks + " " + text2
  tokens = tokenizer.encode(text, return_tensors='pt')
  # if right:
  #   sugs = beam_search_right(tokens, 30, fix)
  # else: 
  #   sugs = beam_search(tokens, 30, fix)
  for s in tokens:
    first_tok = tokenizer.convert_ids_to_tokens(s[0])[0]
    # if not first_tok.startswith('συν'):
      # continue
    converted = tokenizer.convert_ids_to_tokens(s[0])
    converted.reverse()
    # print(converted)
    tok_arr = tokenizer.convert_ids_to_tokens(s[0])
    toks = len(tok_arr)
    st = ''
    for t in tok_arr:
      t = re.sub('[#]+', '', t)
      st += t
    
    if nltk.edit_distance(st, og_text) <= 1:
      strings.append(st + " probability: " + str(s[1]))
  print(strings)
  return strings


def get_desi_result(text1, text2, num_tokens, og_text):
  og_text_string = ''
  for w in og_text:
    og_text_string += f" {w['word']}"
  og_text = clean_text(og_text_string).lower().strip()
  text1 = clean_text(text1)
  text2 = clean_text(text2)
  token_masks = ''
  for i in range(num_tokens):
    token_masks += f' {tokenizer.mask_token} ' 
  text = text1 + " " + token_masks + " " + text2
  tokenized_input = tokenizer(text, return_tensors='pt')

  mask_position = tokenized_input['input_ids'][0].tolist().index(tokenizer.mask_token_id)

  with torch.no_grad():
    predictions = model(**tokenized_input)

  masked_token_predictions = predictions.logits[0, mask_position, :]

  num_top_predictions = 10  # You can choose how many top predictions to consider

  top_predicted_token_ids = torch.topk(masked_token_predictions, num_top_predictions).indices
  predicted_words = [tokenizer.decode([token_id.item()]) for token_id in top_predicted_token_ids]
  top_predicted_tokens = [tokenizer.decode(token_id.item()) for token_id in top_predicted_token_ids]

  strings = []
  for t in top_predicted_token_ids:
    tok_arr = tokenizer.convert_ids_to_tokens(t[0])
    st = ''
    for t in tok_arr:
      t = re.sub('[#]+', '', t)
      st += t
  
  if nltk.edit_distance(st, og_text) <= 1:
    strings.append(st + " probability: " + str(s[1]))

  print(strings)
  # print("Top Predicted Tokens:")
  # for token, token_id in zip(top_predicted_tokens, top_predicted_token_ids):
  #     print(f"{token}: {masked_token_predictions[token_id].item()}")

  return("hi")



import sagemaker
import json
import boto3
from sagemaker.huggingface import HuggingFaceModel
import os 



def get_results(text1, text2, og_text, num_toks):
  aws_access_key_id = os.environ.get('AWS_ACCESS_KEY_ID')
  aws_secret_access_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
  runtime = boto3.client('runtime.sagemaker', aws_access_key_id=aws_access_key_id,
      aws_secret_access_key=aws_secret_access_key, region_name='us-east-1')
  # role = iam_client.get_role(RoleName='SageMakerLogionClient')['Role']['Arn']
  # sess = sagemaker.Session()
  # text1 = '''Χρονογραφία πονηθεῖσα τῷ πανσόφῳ μοναχῷ Μιχαὴλ τῷ ὑπερτίμῳ, ἱστοροῦσα'''
  # text2 = ''' πράξεις τῶν βασιλέων, τοῦ τε Βασιλείου καὶ Κωνσταντίνου τῶν πορφυρογεννήτων, τοῦ τε μετ' αὐτοὺς Ῥωμανοῦ τοῦ Ἀργυροπώλου, τοῦ μετ' ἐκεῖνον Μιχαὴλ τοῦ '''
  text1 = clean_text(text1)
  text2 = clean_text(text2)
  token_masks = ''
  for i in range(num_toks):
    token_masks += f' {tokenizer.mask_token} ' 
  text = text1 + " " + token_masks + " " + text2
  payload = {
    "inputs": f'{text}',
    "parameters": {"top_k": 1000}
  }
  payload_json = json.dumps(payload)

  result  = runtime.invoke_endpoint(
      EndpointName='huggingface-pytorch-inference-2023-09-10-01-38-05-396',
      Body=payload_json,
      ContentType='application/json'
  )
  # Parse the resul
  response_body = result['Body'].read()
  response_json = json.loads(response_body)

  og_text_string = ''
  for w in og_text:
    og_text_string += f" {w['word']}"
  og_text = clean_text(og_text_string).lower().strip()
  # Handle the response as needed

  print(response_json[0])
  if len(response_json) != 1000:
    response_json = response_json[0]
  top_results = get_top_suggestions(response_json, og_text)
  print(top_results)
  return top_results



